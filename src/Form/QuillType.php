<?php

namespace Ehyiah\QuillJsBundle\Form;

use Ehyiah\QuillJsBundle\DTO\Options\DebugOption;
use Ehyiah\QuillJsBundle\DTO\Options\ThemeOption;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\OptionsResolver\OptionsResolver;

class QuillType extends AbstractType
{
    public function buildView(FormView $view, FormInterface $form, array $options)
    {
        $view->vars['attr']['quill_options'] = json_encode($options['quill_options']);
        $view->vars['attr']['quill_extra_options'] = json_encode($options['quill_extra_options']);
        $view->vars['attr']['sanitizer'] = $options['quill_extra_options']['sanitizer'];
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'sanitize_html' => true,
            'label' => false,
            'error_bubbling' => true,
            'quill_options' => ['bold', 'italic'],
            'quill_extra_options' => function(OptionsResolver $resolver) {
                $resolver
                    ->setDefault('debug', 'error')
                    ->setAllowedTypes('debug', 'string')
                    ->setAllowedValues('debug', [DebugOption::DEBUG_OPTION_ERROR, DebugOption::DEBUG_OPTION_WARNING, DebugOption::DEBUG_OPTION_LOG, DebugOption::DEBUG_OPTION_INFO]);
                $resolver
                    ->setDefault('height', '200px')
                    ->setAllowedTypes('height', ['string', 'null'])
                    ->setAllowedValues('height', function (?string $value) {
                        if (null === $value) {
                            return true;
                        }
                        return preg_match('/(\d+)(px$|em$|ex$|%$)/', $value);
                    });
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
                    ->setDefault('sanitizer', 'default')
                    ->setAllowedTypes('sanitizer', 'string')
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
