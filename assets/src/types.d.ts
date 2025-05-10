import {AuthConfig} from './upload-utils';

export type ExtraOptions = {
    theme: string;
    debug: string|null;
    height: string|null;
    placeholder: string|null;
    upload_handler: uploadOptions;
    style: string;
    use_semantic_html: boolean;
    custom_icons?: {[key: string]: string};
    read_only: boolean;
}

export type uploadOptions = {
    type: string;
    upload_endpoint: null|string;
    json_response_file_path: null|string;
    security?: AuthConfig
}

interface ModuleInterface {
    name: string;
    options: string|Array<any>;
}

export type ModuleOptions = {
    name: string;
    options: Array<ModuleInterface>
}
