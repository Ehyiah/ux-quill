export type ExtraOptions = {
    theme: string;
    debug: string|null;
    height: string|null;
    placeholder: string|null;
    upload_handler: uploadOptions;
    style: string;
    modules: Array<any>;
}

export type uploadOptions = {
    type: string;
    path: string;
}

interface ModuleInterface {
    name: string;
}

export interface EmojiModule extends ModuleInterface {
    enabled: string;
}

export interface ResizeModule extends ModuleInterface {
    options: Array<any>;
}

export type ModuleOptions = {
    name: string;
    options: Array<ModuleInterface>
}
