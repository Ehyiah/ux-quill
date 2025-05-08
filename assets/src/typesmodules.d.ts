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
}

interface ModuleInterface {
    name: string;
    options: string|Array<any>;
}

export interface EmojiModule extends ModuleInterface {
    options: string;
}

export interface ResizeModule extends ModuleInterface {
    options: Array<any>;
}

export interface SyntaxModule extends ModuleInterface {
    options: Array<any>;
}

export type ModuleOptions = {
    name: string;
    options: Array<ModuleInterface>
}

export interface IconCustomizationOptions {
    [key: string]: string; // Nom de l'icône -> contenu SVG ou nom du module (aria-label) -> contenu SVG
}
