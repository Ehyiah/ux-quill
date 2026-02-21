<?php

namespace Ehyiah\QuillJsBundle\Form;

use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillBlockFieldInterface;
use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillFieldModuleInterface;
use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillInlineFieldInterface;
use Ehyiah\QuillJsBundle\DTO\Modules\ModuleInterface;
use Ehyiah\QuillJsBundle\DTO\Options\DebugOption;
use Ehyiah\QuillJsBundle\DTO\Options\StyleOption;
use Ehyiah\QuillJsBundle\DTO\Options\ThemeOption;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Translation\TranslatableMessage;
use Symfony\Contracts\Translation\TranslatableInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class QuillType extends AbstractType
{
    public function __construct(
        private readonly TranslatorInterface $translator,
    ) {
    }

    public function buildView(FormView $view, FormInterface $form, array $options): void
    {
        $fields = $options['quill_options'];
        $modules = $options['modules'];

        $finalFields = [];
        foreach ($fields as $fieldOrGroup) {
            if (is_array($fieldOrGroup)) {
                $group = [];
                foreach ($fieldOrGroup as $field) {
                    $this->addAutoModule($field, $modules);
                    $group = array_merge($group, $this->resolveFieldOption($field));
                }
                $finalFields[] = $group;
            } else {
                $this->addAutoModule($fieldOrGroup, $modules);
                $finalFields = array_merge($finalFields, $this->resolveFieldOption($fieldOrGroup));
            }
        }

        $view->vars['attr']['quill_options'] = json_encode($finalFields);

        $extraOptions = $options['quill_extra_options'];

        // Handle callable (closure) for quill_extra_options (Symfony 8 compatibility)
        if (is_callable($extraOptions)) {
            $extraResolver = new OptionsResolver();
            $extraOptions($extraResolver);
            $extraOptions = $extraResolver->resolve([]);
        }

        if (isset($extraOptions['placeholder']) && $extraOptions['placeholder'] instanceof TranslatableInterface) {
            $extraOptions['placeholder'] = $extraOptions['placeholder']->trans($this->translator);
        }

        $view->vars['attr']['quill_extra_options'] = json_encode($extraOptions);
        $view->vars['attr']['quill_modules_options'] = json_encode($modules);

        $view->vars['quill_assets'] = $this->getCustomAssets($extraOptions['assets'] ?? []);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'label' => false,
            'error_bubbling' => true,
            'quill_options' => [['bold', 'italic']],
            'modules' => [],
            'quill_extra_options' => static function (OptionsResolver $extraResolver) {
                $extraResolver
                    ->setDefault('upload_handler', static function (OptionsResolver $spoolResolver): void {
                        $spoolResolver->setDefaults([
                            'type' => 'form',
                            'upload_endpoint' => null,
                            'json_response_file_path' => null,
                            'security' => static function (OptionsResolver $securityResolver) {
                                $securityResolver->setDefaults([
                                    'type' => null,
                                    'jwt_token' => null,
                                    'username' => null,
                                    'password' => null,
                                    'custom_header' => null,
                                    'custom_header_value' => null,
                                ]);
                                $securityResolver->setAllowedTypes('type', ['string', 'null']);
                                $securityResolver->setAllowedValues('type', ['basic', 'jwt', 'custom_header', null]);
                                $securityResolver->setAllowedTypes('jwt_token', ['string', 'null']);
                                $securityResolver->setAllowedTypes('username', ['string', 'null']);
                                $securityResolver->setAllowedTypes('password', ['string', 'null']);
                                $securityResolver->setAllowedTypes('custom_header', ['string', 'null']);
                                $securityResolver->setAllowedTypes('custom_header_value', ['string', 'null']);
                            },
                        ]);
                        $spoolResolver->setAllowedTypes('type', ['string', 'null']);
                        $spoolResolver->setAllowedValues('type', ['json', 'form', null]);
                        $spoolResolver->setAllowedTypes('upload_endpoint', ['string', 'null']);
                        $spoolResolver->setAllowedTypes('json_response_file_path', ['string', 'null']);
                        $spoolResolver->setAllowedTypes('security', ['array', 'null']);
                    })
                ;
                $extraResolver
                    ->setDefault('debug', DebugOption::DEBUG_OPTION_ERROR)
                    ->setAllowedTypes('debug', 'string')
                    ->setAllowedValues('debug', [DebugOption::DEBUG_OPTION_ERROR, DebugOption::DEBUG_OPTION_WARNING, DebugOption::DEBUG_OPTION_LOG, DebugOption::DEBUG_OPTION_INFO])
                ;
                $extraResolver
                    ->setDefault('height', '200px')
                    ->setAllowedTypes('height', ['string', 'null'])
                    ->setAllowedValues('height', static function (?string $value) {
                        if (null === $value) {
                            return true;
                        }

                        return preg_match('/(\d+)(px$|em$|ex$|%$)/', $value);
                    })
                ;
                $extraResolver
                    ->setDefault('theme', 'snow')
                    ->setAllowedTypes('theme', 'string')
                    ->setAllowedValues('theme', [ThemeOption::QUILL_THEME_SNOW, ThemeOption::QUILL_THEME_BUBBLE])
                ;
                $extraResolver
                    ->setDefault('placeholder', 'Quill editor')
                    ->setAllowedTypes('placeholder', ['string', TranslatableMessage::class, TranslatableInterface::class])
                ;
                $extraResolver
                    ->setDefault('style', StyleOption::QUILL_STYLE_CLASS)
                    ->setAllowedTypes('style', 'string')
                    ->setAllowedValues('style', [StyleOption::QUILL_STYLE_INLINE, StyleOption::QUILL_STYLE_CLASS])
                ;
                $extraResolver
                    ->setDefault('modules', [])
                    ->setAllowedTypes('modules', ['array'])
                ;
                $extraResolver
                    ->setDefault('use_semantic_html', false)
                    ->setAllowedTypes('use_semantic_html', 'bool')
                    ->setAllowedValues('use_semantic_html', [true, false])
                ;
                $extraResolver
                    ->setDefault('custom_icons', [])
                ;
                $extraResolver
                    ->setDefault('read_only', false)
                    ->setAllowedTypes('read_only', 'bool')
                ;
                $extraResolver
                    ->setDefault('assets', [])
                    ->setAllowedTypes('assets', ['array'])
                ;
            },
        ]);

        $resolver->setAllowedTypes('quill_options', ['array']);
        $resolver->setAllowedTypes('quill_extra_options', ['array', 'callable']);
        $resolver->setAllowedTypes('modules', ['array']);
        $resolver->setAllowedValues('modules', static function (array $values) {
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
     * @param array<ModuleInterface> $modules
     */
    private function addAutoModule(mixed $field, array &$modules): void
    {
        if ($field instanceof QuillFieldModuleInterface) {
            foreach ($field::importModules() as $moduleClass) {
                if (in_array($moduleClass::NAME, array_column($modules, 'name'), true)) {
                    continue;
                }

                $modules[] = new $moduleClass();
            }
        }
    }

    /**
     * @return array<mixed>
     */
    private function resolveFieldOption(mixed $field): array
    {
        if ($field instanceof QuillInlineFieldInterface) {
            return [$field->getOption()];
        }

        if ($field instanceof QuillBlockFieldInterface) {
            $options = [];
            foreach ($field->getOption() as $key => $option) {
                $options[][$key] = $option;
            }

            return $options;
        }

        return (array)$field;
    }

    /**
     * @param array<mixed> $customAssets
     *
     * @return array<mixed>
     */
    private function getCustomAssets(array $customAssets): array
    {
        return [
            'styleSheets' => $customAssets['styleSheets'] ?? [],
            'scripts' => $customAssets['scripts'] ?? [],
        ];
    }
}
