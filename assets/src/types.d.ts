import { AuthConfig } from './upload-utils';

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

export type MediaGalleryOptions = {
    listEndpoint: string;
    uploadEndpoint?: string;
    searchEndpoint?: string;
    icon?: string;
    buttonTitle?: string;
    uploadTitle?: string;
    messageLoadingOption?: string;
    messageNextPageOption?: string;
    messagePrevPageOption?: string;
    messageErrorOption?: string;
    messageNoImageOption?: string;
    messageSearchPlaceholderOption?: string;
    authConfig?: AuthConfig;
    jsonResponseFilePath?: string;
    uploadStrategy?: 'form' | 'json';
}

export interface ReadingTimeOptions {
    wpm?: number;
    label?: string;
    suffix?: string;
    target?: string;
    readTimeOk?: number;
    readTimeMedium?: number;
}

export type SpeechToTextOptions = {
    language?: string;
    continuous?: boolean;
    visualizer?: boolean;
    waveformColor?: string;
    histogramColor?: string;
    debug?: boolean;
    buttonTitleStart?: string;
    buttonTitleStop?: string;
    titleInactive?: string;
    titleStarting?: string;
    titleActive?: string;
};

export type CountOptions = {
    words?: boolean;
    words_label?: string;
    words_container?: string;
    characters?: boolean;
    characters_label?: string;
    characters_container?: string;
}

export interface ModuleInterface {
    name: string;
    options: any | MediaGalleryOptions | ReadingTimeOptions | SpeechToTextOptions | CountOptions;
}

export type ModuleOptions = ModuleInterface[];
