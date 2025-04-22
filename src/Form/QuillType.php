<?php

namespace Ehyiah\QuillJsBundle\Form;

use Ehyiah\QuillJsBundle\DTO\Options\DebugOption;
use Ehyiah\QuillJsBundle\DTO\Options\Modules\EmojiModule;
use Ehyiah\QuillJsBundle\DTO\Options\Modules\ResizeModule;
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
        $modules = $options['quill_extra_options']['modules'];

        foreach ($fields as $field) {
            if (is_array($field) && !in_array(EmojiModule::NAME, array_column($modules, 'name'), true)) {
                $modules[] = new EmojiModule();
            } elseif (in_array('emoji', $fields, true) && !in_array(EmojiModule::NAME, array_column($modules, 'name'), true)) {
                $modules[] = new EmojiModule();
            }
        }
        foreach ($fields as $field) {
            if (is_array($field) && !in_array(ResizeModule::NAME, array_column($modules, 'name'), true)) {
                $modules[] = new ResizeModule();
            } elseif (in_array('image', $fields, true) && !in_array(ResizeModule::NAME, array_column($modules, 'name'), true)) {
                $modules[] = new ResizeModule();
            }
        }
        $options['quill_extra_options']['modules'] = $modules;
        $view->vars['attr']['quill_extra_options'] = json_encode($options['quill_extra_options']);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'sanitize_html' => false,
            'label' => false,
            'error_bubbling' => true,
            'quill_options' => ['bold', 'italic'],
            'quill_extra_options' => function (OptionsResolver $resolver) {
                $resolver
                    ->setDefault('upload_handler', function (OptionsResolver $spoolResolver): void {
                        $spoolResolver->setDefaults([
                            'type' => 'form',
                            'upload_endpoint' => null,
                            'json_response_file_path' => null,
                        ]);
                        $spoolResolver->setAllowedTypes('type', ['string', 'null']);
                        $spoolResolver->setAllowedValues('type', ['json', 'form', null]);
                        $spoolResolver->setAllowedTypes('upload_endpoint', ['string', 'null']);
                        $spoolResolver->setAllowedTypes('json_response_file_path', ['string', 'null']);
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
            },
        ]);

        $resolver->setAllowedTypes('quill_options', ['array']);
    }

    public function getBlockPrefix(): string
    {
        return 'quill';
    }

    public function getParent(): string
    {
        return TextareaType::class;
    }
}
