variable "project" {
  type    = string
  default = "freshcart"
}

variable "env" {
  type    = string
  default = "dev"
  validation {
    condition     = contains(["dev", "staging", "prod"], var.env)
    error_message = "env must be one of dev, staging, prod."
  }
}

variable "region" {
  type    = string
  default = "us-east-1"
}

variable "freshness_sla_hours" {
  type    = number
  default = 24
}

variable "subnet_ids" {
  type    = list(string)
  default = [] # supply real subnet IDs at deploy
}

variable "security_group_ids" {
  type    = list(string)
  default = []
}
