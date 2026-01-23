import { AuthConfig } from './upload-utils.ts';

export type ExtraOptions = {
    theme: string;
    debug: 'error' | 'warn' | 'log' | 'info' | null;
    height: string | null;
    placeholder: string | null;
    upload_handler: UploadOptions;
    style: 'class' | 'inline';
    use_semantic_html: boolean;
    custom_icons?: { [key: string]: string };
    read_only: boolean;
    assets?: {
        styleSheets?: string[] | { [key: string]: string };
        scripts?: string[] | { [key: string]: string };
    };
}

export type UploadOptions = {
    type: 'form' | 'json';
    upload_endpoint: null | string;
    json_response_file_path: null | string;
    security?: AuthConfig;
}

export interface ModuleInterface {
    name: string;
    options: any;
}

export type ModuleOptions = ModuleInterface[];
