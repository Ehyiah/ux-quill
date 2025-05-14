<?php

namespace Ehyiah\QuillJsBundle\Form;

use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\CodeBlockField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\EmojiField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\ImageField;
use Ehyiah\QuillJsBundle\DTO\Modules\EmojiModule;
use Ehyiah\QuillJsBundle\DTO\Modules\ModuleInterface;
use Ehyiah\QuillJsBundle\DTO\Modules\ResizeModule;
use Ehyiah\QuillJsBundle\DTO\Modules\SyntaxModule;
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
        $view->vars['attr']['sanitizer'] = $options['quill_extra_options']['sanitizer'];

        $fields = $options['quill_options'];
        $modules = $options['modules'];

        foreach ($this->getAutomaticModulesToConfigure() as $config) {
            $this->addAutoModuleIfRequired($fields, $modules, $config['moduleName'], $config['fieldIdentifier'], $config['moduleClass']);
        }

        $view->vars['attr']['quill_extra_options'] = json_encode($options['quill_extra_options']);
        $view->vars['attr']['quill_modules_options'] = json_encode($modules);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'sanitize_html' => false,
            'label' => false,
            'error_bubbling' => true,
            'quill_options' => ['bold', 'italic'],
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
                    ->setDefault('sanitizer', null)
                    ->setAllowedTypes('sanitizer', ['string', 'null'])
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
        ];
    }

    /**
     * Ajoute un module au tableau des modules s'il n'existe pas déjà et si un champ correspondant est présent
     *
     * @param array<mixed> $fields Tableau des champs à vérifier
     * @param array<array<string, string>> $modules Tableau des modules à compléter
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
}
