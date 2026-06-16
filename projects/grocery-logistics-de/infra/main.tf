# FreshCart data platform — Infrastructure as Code (AWS reference).
#
# This is a documented reference of the cloud resources the local project maps to.
# It is intentionally minimal and uses placeholder values; `terraform plan` shows the
# shape of a real deployment. The point is to demonstrate that the platform is
# reproducible infrastructure, not click-ops.
#
# Local component            -> AWS resource declared here
#   data/lake/*.parquet      -> S3 bucket (bronze/silver/gold prefixes)
#   DuckDB warehouse         -> Athena (query S3) or Redshift Serverless
#   orchestrate.py DAG       -> MWAA (Managed Airflow)
#   stream_simulator/topic   -> MSK (Managed Kafka) / Kinesis
#   Docker image             -> ECR repository
#   run metrics/alerts       -> CloudWatch

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

# ---------------------------------------------------------------------------
# Lakehouse storage: one bucket, three medallion prefixes + a quarantine prefix.
# ---------------------------------------------------------------------------
resource "aws_s3_bucket" "lake" {
  bucket = "${var.project}-lake-${var.env}"
  tags   = local.tags
}

resource "aws_s3_bucket_versioning" "lake" {
  bucket = aws_s3_bucket.lake.id
  versioning_configuration { status = "Enabled" } # bronze must be replayable
}

resource "aws_s3_bucket_lifecycle_configuration" "lake" {
  bucket = aws_s3_bucket.lake.id
  rule {
    id     = "bronze-archive"
    status = "Enabled"
    filter { prefix = "bronze/" }
    transition {
      days          = 90
      storage_class = "GLACIER" # cold raw history is cheap to keep, rarely read
    }
  }
}

# ---------------------------------------------------------------------------
# Streaming: a Kafka (MSK) cluster for the order + GPS event topics.
# (Sized small; production scales brokers + partitions with throughput.)
# ---------------------------------------------------------------------------
resource "aws_msk_serverless_cluster" "events" {
  cluster_name = "${var.project}-events-${var.env}"
  vpc_config {
    subnet_ids         = var.subnet_ids
    security_group_ids = var.security_group_ids
  }
  client_authentication {
    sasl { iam { enabled = true } }
  }
  tags = local.tags
}

# ---------------------------------------------------------------------------
# Container registry for the pipeline image (built in CI, run by MWAA/ECS).
# ---------------------------------------------------------------------------
resource "aws_ecr_repository" "pipeline" {
  name                 = "${var.project}-pipeline"
  image_tag_mutability = "IMMUTABLE" # pin exact image per deploy
  image_scanning_configuration { scan_on_push = true }
  tags = local.tags
}

# ---------------------------------------------------------------------------
# Observability: alarm if the daily pipeline misses its freshness SLA.
# ---------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "freshness_sla" {
  alarm_name          = "${var.project}-gold-freshness-${var.env}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "GoldFreshnessLagHours"
  namespace           = "FreshCart/Pipeline"
  period              = 3600
  statistic           = "Maximum"
  threshold           = var.freshness_sla_hours
  alarm_description   = "Gold layer is older than the freshness SLA."
  tags                = local.tags
}

locals {
  tags = {
    project   = var.project
    env       = var.env
    managedBy = "terraform"
  }
}
