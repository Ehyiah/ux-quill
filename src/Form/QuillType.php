<?php

namespace Ehyiah\QuillJsBundle\Form;

use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\CodeBlockField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\EmojiField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\FormulaField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\ImageField;
use Ehyiah\QuillJsBundle\DTO\Modules\EmojiModule;
use Ehyiah\QuillJsBundle\DTO\Modules\HtmlEditModule;
use Ehyiah\QuillJsBundle\DTO\Modules\ModuleInterface;
use Ehyiah\QuillJsBundle\DTO\Modules\ResizeModule;
use Ehyiah\QuillJsBundle\DTO\Modules\SyntaxModule;
use Ehyiah\QuillJsBundle\DTO\Modules\TableModule;
use Ehyiah\QuillJsBundle\DTO\Options\DebugOption;
use Ehyiah\QuillJsBundle\DTO\Options\StyleOption;
use Ehyiah\QuillJsBundle\DTO\Options\ThemeOption;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\OptionsResolver\OptionsResolver;

class QuillType extends AbstractType
{
    public function buildView(FormView $view, FormInterface $form, array $options): void
    {
        $view->vars['attr']['quill_options'] = json_encode($options['quill_options']);

        $fields = $options['quill_options'];
        $modules = $options['modules'];

        foreach ($this->getAutomaticModulesToConfigure() as $config) {
            $this->addAutoModuleIfRequired($fields, $modules, $config['moduleName'], $config['fieldIdentifier'], $config['moduleClass']);
        }

        $view->vars['attr']['quill_extra_options'] = json_encode($options['quill_extra_options']);
        $view->vars['attr']['quill_modules_options'] = json_encode($modules);

        $assets = $this->getBuiltInAssets($fields, $modules, $options);
        $view->vars['quill_assets'] = $assets;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'label' => false,
            'error_bubbling' => true,
            'quill_options' => [['bold', 'italic']],
            'modules' => [],
            'quill_extra_options' => function (OptionsResolver $resolver) {
                $resolver
                    ->setDefault('upload_handler', function (OptionsResolver $spoolResolver): void {
                        $spoolResolver->setDefaults([
                            'type' => 'form',
                            'upload_endpoint' => null,
                            'json_response_file_path' => null,
                            'security' => function (OptionsResolver $resolver) {
                                $resolver->setDefaults([
                                    'type' => null,
                                    'jwt_token' => null,
                                    'username' => null,
                                    'password' => null,
                                    'custom_header' => null,
                                    'custom_header_value' => null,
                                ]);
                                $resolver->setAllowedTypes('type', ['string']);
                                $resolver->setAllowedValues('type', ['basic', 'jwt']);
                                $resolver->setAllowedTypes('jwt_token', ['string', 'null']);
                                $resolver->setAllowedTypes('username', ['string', 'null']);
                                $resolver->setAllowedTypes('password', ['string', 'null']);
                                $resolver->setAllowedTypes('custom_header', ['string', 'null']);
                                $resolver->setAllowedTypes('custom_header_value', ['string', 'null']);
                            },
                        ]);
                        $spoolResolver->setAllowedTypes('type', ['string', 'null']);
                        $spoolResolver->setAllowedValues('type', ['json', 'form', null]);
                        $spoolResolver->setAllowedTypes('upload_endpoint', ['string', 'null']);
                        $spoolResolver->setAllowedTypes('json_response_file_path', ['string', 'null']);
                        $spoolResolver->setAllowedTypes('security', ['array', 'null']);
                        $spoolResolver->setDefault('security', null);
                    })
                ;
                $resolver
                    ->setDefault('debug', DebugOption::DEBUG_OPTION_ERROR)
                    ->setAllowedTypes('debug', 'string')
                    ->setAllowedValues('debug', [DebugOption::DEBUG_OPTION_ERROR, DebugOption::DEBUG_OPTION_WARNING, DebugOption::DEBUG_OPTION_LOG, DebugOption::DEBUG_OPTION_INFO])
                ;
                $resolver
                    ->setDefault('height', '200px')
                    ->setAllowedTypes('height', ['string', 'null'])
                    ->setAllowedValues('height', function (?string $value) {
                        if (null === $value) {
                            return true;
                        }

                        return preg_match('/(\d+)(px$|em$|ex$|%$)/', $value);
                    })
                ;
                $resolver
                    ->setDefault('theme', 'snow')
                    ->setAllowedTypes('theme', 'string')
                    ->setAllowedValues('theme', [ThemeOption::QUILL_THEME_SNOW, ThemeOption::QUILL_THEME_BUBBLE])
                ;
                $resolver
                    ->setDefault('placeholder', 'Quill editor')
                    ->setAllowedTypes('placeholder', 'string')
                ;
                $resolver
                    ->setDefault('style', StyleOption::QUILL_STYLE_CLASS)
                    ->setAllowedTypes('style', 'string')
                    ->setAllowedValues('style', [StyleOption::QUILL_STYLE_INLINE, StyleOption::QUILL_STYLE_CLASS])
                ;
                $resolver
                    ->setDefault('modules', [])
                    ->setAllowedTypes('modules', ['array'])
                ;
                $resolver
                    ->setDefault('use_semantic_html', false)
                    ->setAllowedTypes('use_semantic_html', 'bool')
                    ->setAllowedValues('use_semantic_html', [true, false])
                ;
                $resolver
                    ->setDefault('custom_icons', [])
                ;
                $resolver
                    ->setDefault('read_only', false)
                    ->setAllowedTypes('read_only', 'bool')
                ;
                $resolver
                    ->setDefault('assets', [])
                    ->setAllowedTypes('assets', ['array'])
                ;
            },
        ]);

        $resolver->setAllowedTypes('quill_options', ['array']);
        $resolver->setAllowedTypes('modules', ['array']);
        $resolver->setAllowedValues('modules', function (array $values) {
            foreach ($values as $value) {
                if (!$value instanceof ModuleInterface) {
                    return false;
                }
            }

            return true;
        });
    }

    public function getBlockPrefix(): string
    {
        return 'quill';
    }

    public function getParent(): string
    {
        return TextareaType::class;
    }

    /**
     * @return array<array<string, string>>
     */
    private function getAutomaticModulesToConfigure(): array
    {
        return [
            [
                'moduleName' => EmojiModule::NAME,
                'fieldIdentifier' => (new EmojiField())->getOption(),
                'moduleClass' => EmojiModule::class,
            ],
            [
                'moduleName' => ResizeModule::NAME,
                'fieldIdentifier' => (new ImageField())->getOption(),
                'moduleClass' => ResizeModule::class,
            ],
            [
                'moduleName' => SyntaxModule::NAME,
                'fieldIdentifier' => (new CodeBlockField())->getOption(),
                'moduleClass' => SyntaxModule::class,
            ],
            [
                'moduleName' => TableModule::NAME,
                'fieldIdentifier' => 'table-better',
                'moduleClass' => TableModule::class,
            ],
        ];
    }

    /**
     * Ajoute un module au tableau des modules s'il n'existe pas déjà et si un champ correspondant est présent
     * permet une configuration par défaut des modules lorsque ceux-ci sont nécessaires
     * Si le module a été mis par l'utilisateur, alors la version de l'utilisateur sera conservée
     *
     * @param array<mixed> $fields Tableau des champs à vérifier
     * @param array<array<string, string>|object> $modules Tableau des modules à compléter
     * @param string $moduleName Nom du module à vérifier
     * @param string $fieldIdentifier Identifiant du champ à rechercher
     * @param string $moduleClass Classe du module à instancier
     */
    private function addAutoModuleIfRequired(array $fields, array &$modules, string $moduleName, string $fieldIdentifier, string $moduleClass): void
    {
        if (in_array($moduleName, array_column($modules, 'name'), true)) {
            return;
        }

        if (in_array($fieldIdentifier, $fields, true)) {
            $modules[] = new $moduleClass();

            return;
        }

        foreach ($fields as $field) {
            if (is_array($field)
                && (in_array($fieldIdentifier, $field, true)
                 || isset($field[$fieldIdentifier])
                 || array_key_exists($fieldIdentifier, $field))) {
                $modules[] = new $moduleClass();

                return;
            }
        }
    }

    /**
     * @param array<mixed> $fields
     * @param array<mixed> $modules
     * @param array<mixed> $options
     *
     * @return array<mixed>
     */
    private function getBuiltInAssets(array $fields, array $modules, array $options): array
    {
        $assets['styleSheets'] = [];
        $assets['scripts'] = [];

        $formulaFieldOption = (new FormulaField())->getOption();
        foreach ($fields as $fieldGroup) {
            $hasFormula = is_array($fieldGroup)
                ? in_array($formulaFieldOption, $fieldGroup, true)
                : $fieldGroup === $formulaFieldOption;

            if ($hasFormula) {
                $assets['styleSheets']['katex'] = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
                $assets['scripts']['katex'] = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
            }
        }

        foreach ($modules as $module) {
            if ($module instanceof SyntaxModule) {
                $assets['styleSheets']['highlight'] = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css';
                $assets['scripts']['highlight'] = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
            }
            if ($module instanceof HtmlEditModule && (isset($module->options['syntax']) && true === $module->options['syntax'])) {
                $assets['styleSheets']['highlight'] = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css';
                $assets['scripts']['highlight'] = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
                $assets['scripts']['highlight2'] = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/xml.min.js';
            }
        }

        if (isset($options['quill_extra_options']['assets']) && count($options['quill_extra_options']['assets']) > 0) {
            $assets = $this->getCustomAssets($options['quill_extra_options']['assets'], $assets);
        }

        return $assets;
    }

    /**
     * @param array<mixed> $customAssets
     * @param array<mixed> $assets
     *
     * @return array<mixed>
     */
    private function getCustomAssets(array $customAssets, array $assets): array
    {
        if (isset($customAssets['styleSheets'])) {
            $assets['styleSheets'] = array_merge($assets['styleSheets'], $customAssets['styleSheets']);
        }
        if (isset($customAssets['scripts'])) {
            $assets['scripts'] = array_merge($assets['scripts'], $customAssets['scripts']);
        }

        return $assets;
    }
}
