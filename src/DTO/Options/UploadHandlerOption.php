<?php

namespace Ehyiah\QuillJsBundle\DTO\Options;

class UploadHandlerOption
{
    public const UPLOADER_TYPE = 'type';
    public const UPLOADER_TYPE_OPTION_JSON = 'json';
    public const UPLOADER_TYPE_OPTION_FORM_DATA = 'form';

    public const UPLOADER_UPLOAD_ENDPOINT = 'upload_endpoint';
    public const UPLOADER_JSON_FILE_PATH = 'json_response_file_path';

    public const UPLOADER_SECURITY = 'security';
    public const UPLOADER_SECURITY_JWT = 'jwt';
    public const UPLOADER_SECURITY_BASIC = 'basic';
    public const UPLOADER_SECURITY_CUSTOM_HEADER = 'custom_header';
}
