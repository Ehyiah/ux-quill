<?php

namespace Ehyiah\QuillJsBundle\Config;

use Closure;
use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillBlockFieldInterface;
use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillFieldModuleInterface;
use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillInlineFieldInterface;
use Ehyiah\QuillJsBundle\DTO\Modules\NodeMoverModule;
use Ehyiah\QuillJsBundle\DTO\Options\DebugOption;
use Ehyiah\QuillJsBundle\DTO\Options\StyleOption;
use Ehyiah\QuillJsBundle\DTO\Options\ThemeOption;
use Exception;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Translation\TranslatableMessage;
use Symfony\Contracts\Translation\TranslatableInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

final class QuillConfigBuilder
{
    public function __construct(
        private readonly TranslatorInterface $translator,
    ) {
    }

    /**
     * @param array<int, mixed> $fields
     * @param array<int, object> $modules
     * @param array<string, mixed>|callable $extraOptions
     */
    public function build(array $fields, array $modules, array|callable $extraOptions): QuillConfig
    {
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

        $extraResolver = new OptionsResolver();
        $this->configureExtraOptions($extraResolver);

        if (is_callable($extraOptions)) {
            $extraOptions($extraResolver);
            $extraOptions = $extraResolver->resolve([]);
        } else {
            $extraOptions = $extraResolver->resolve($extraOptions);
        }

        if (isset($extraOptions['placeholder']) && $extraOptions['placeholder'] instanceof TranslatableInterface) {
            $extraOptions['placeholder'] = $extraOptions['placeholder']->trans($this->translator);
        }

        $nodeMoverFound = false;
        foreach ($modules as $i => $module) {
            if ($module instanceof NodeMoverModule) {
                $nodeMoverFound = true;
                if (isset($module->options['active']) && false === $module->options['active']) {
                    unset($modules[$i]);
                }
            }
        }
        if (!$nodeMoverFound) {
            $modules[] = new NodeMoverModule();
        }
        $modules = array_values($modules);

        $assets = $this->getCustomAssets($extraOptions['assets'] ?? []);

        return new QuillConfig($finalFields, $modules, $extraOptions, $assets);
    }

    public function configureExtraOptions(OptionsResolver $extraResolver): void
    {
        self::defineNestedOptions($extraResolver, 'upload_handler', static function (OptionsResolver $spoolResolver): void {
            $spoolResolver->setDefaults([
                'type' => 'form',
                'upload_endpoint' => null,
                'json_response_file_path' => null,
            ]);
            self::defineNestedOptions($spoolResolver, 'security', static function (OptionsResolver $securityResolver): void {
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
            });
            $spoolResolver->setAllowedTypes('type', ['string', 'null']);
            $spoolResolver->setAllowedValues('type', ['json', 'form', null]);
            $spoolResolver->setAllowedTypes('upload_endpoint', ['string', 'null']);
            $spoolResolver->setAllowedTypes('json_response_file_path', ['string', 'null']);
            $spoolResolver->setAllowedTypes('security', ['array', 'null']);
        });
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

                return (bool)preg_match('/(\d+)(px$|em$|ex$|%$)/', $value);
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
    }

    public static function defineNestedOptions(OptionsResolver $resolver, string $option, Closure $configurator): void
    {
        if (method_exists($resolver, 'setOptions')) {
            $resolver->setOptions($option, $configurator);
        } else {
            $resolver->setDefault($option, $configurator);
        }
    }

    /**
     * @param array<int, object> $modules
     */
    private function addAutoModule(mixed $field, array &$modules): void
    {
        if ($field instanceof QuillFieldModuleInterface) {
            foreach ($field::importModules() as $moduleClass) {
                if (in_array($moduleClass::NAME, array_column($modules, 'name'), true)) {
                    continue;
                }

                try {
                    $modules[] = new $moduleClass();
                } catch (Exception $e) {
                    trigger_error(sprintf(
                        'Could not auto-import module "%s" required by field "%s": %s',
                        $moduleClass,
                        $field::class,
                        $e->getMessage(),
                    ), E_USER_WARNING);
                    continue;
                }
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
