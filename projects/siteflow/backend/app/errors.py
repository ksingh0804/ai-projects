"""Errors the API is allowed to show a user.

The message is a short code plus a detail sentence. Stack traces stay in the
server log. A superintendent should never see a Python traceback.
"""


class SiteflowError(Exception):
    status = 400
    code = "bad_request"

    def __init__(self, detail: str) -> None:
        super().__init__(detail)
        self.detail = detail


class InvalidIdentifier(SiteflowError):
    code = "invalid_identifier"


class UnsupportedFileType(SiteflowError):
    code = "unsupported_file_type"


class FileTooLarge(SiteflowError):
    status = 413
    code = "file_too_large"


class EmptyUpload(SiteflowError):
    code = "empty_file"


class InvalidDocument(SiteflowError):
    code = "invalid_document"


class UnknownThread(SiteflowError):
    status = 404
    code = "unknown_thread"


class ApprovalPending(SiteflowError):
    status = 409
    code = "approval_pending"


class NotAwaitingApproval(SiteflowError):
    status = 409
    code = "not_awaiting_approval"


class ThreadProjectMismatch(SiteflowError):
    status = 409
    code = "thread_project_mismatch"
