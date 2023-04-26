export type AuditPackageResponse = {
    package_manager: string,
    packages: { name: string, risks: [], version: string }[],
    request_name: string
    request_type: string
    url: string
}
