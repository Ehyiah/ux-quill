import Quill from 'quill';

export interface DynamicQuillModule {
    moduleName: string;
    jsPath: (string | (() => Promise<any>))[];
    cssPath?: string[];
    toolbarKeyword: string;
    isLocalModule?: boolean;
}

export class DynamicModuleLoader {
    private modules: DynamicQuillModule[] = [];
    private loadPromise: Promise<void> = Promise.resolve();

    constructor(modules: DynamicQuillModule[] = []) {
        this.modules = modules;
    }

    private isKeywordPresent(config: any, keyword: string): boolean {
        if (!config) return false;

        const configStr = JSON.stringify(config);
        return configStr.includes(`"${keyword}"`) || configStr.includes(`:"${keyword}"`);
    }

    private async loadModule(module: DynamicQuillModule): Promise<void> {
        console.log(`Loading module ${module.moduleName}...`);

        if (module.cssPath && module.cssPath.length > 0) {
            for (const cssPath of module.cssPath) {
                try {
                    await import(cssPath);
                    console.log(`CSS ${cssPath} du module ${module.moduleName} chargé`);
                } catch (error) {
                    console.error(`Error while loading du CSS ${cssPath} pour ${module.moduleName}:`, error);
                }
            }
        }

        if (module.jsPath.length === 0) {
            console.warn(`Please specify a JS path ${module.moduleName}`);
            return;
        }

        try {
            const primaryJsPath = module.jsPath[0];
            let importedModule;

            if (typeof primaryJsPath === 'function') {
                importedModule = await primaryJsPath();
            } else {
                importedModule = await import(primaryJsPath);
            }

            const moduleToUse = importedModule.default || importedModule;
            Quill.register(`modules/${module.moduleName}`, moduleToUse);

            if (module.jsPath.length > 1) {
                for (let i = 1; i < module.jsPath.length; i++) {
                    await import(module.jsPath[i]);
                    console.log(`Module JS supplémentaire ${module.jsPath[i]} chargé`);
                }
            }

            console.log(`Module ${module.moduleName} loaded`);
        } catch (error) {
            console.error(`Error while loading ${module.moduleName}:`, error);
            throw error;
        }
    }

    public loadModules(config: any): Promise<void> {
        const modulesToLoad = this.modules.filter(module => {
            // First search if moduleName is present
            if (config.modules && config.modules[module.moduleName]) {
                return true;
            }

            // If module name is not found then search in toolbar options
            if (config.modules && config.modules) {
                return this.isKeywordPresent(config.modules.toolbar, module.toolbarKeyword);
            }

            return false;
        });

        if (modulesToLoad.length === 0) {
            return Promise.resolve();
        }

        this.loadPromise = Promise.all(
            modulesToLoad.map(module => this.loadModule(module))
        ).then(() => {
            console.log('All modules are loaded');
        }).catch(error => {
            console.error('Error while loading module :', error);
        });

        return this.loadPromise;
    }
}
