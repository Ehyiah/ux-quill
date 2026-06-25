<?php

namespace Ehyiah\QuillJsBundle\Form;

use Ehyiah\QuillJsBundle\Config\QuillConfigBuilder;
use Ehyiah\QuillJsBundle\DTO\Modules\ModuleInterface;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\OptionsResolver\OptionsResolver;

class QuillType extends AbstractType
{
    public function __construct(
        private readonly QuillConfigBuilder $configBuilder,
    ) {
    }

    public function buildView(FormView $view, FormInterface $form, array $options): void
    {
        $config = $this->configBuilder->build(
            fields: $options['quill_options'],
            modules: $options['modules'],
            extraOptions: $options['quill_extra_options'],
        );

        $view->vars['attr']['quill_options'] = json_encode($config->toolbarConfig);
        $view->vars['attr']['quill_extra_options'] = json_encode($config->extraOptions);
        $view->vars['attr']['quill_modules_options'] = json_encode($config->modules);
        $view->vars['quill_assets'] = $config->assets;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'label' => false,
            'quill_options' => [['bold', 'italic']],
            'modules' => [],
        ]);
        QuillConfigBuilder::defineNestedOptions($resolver, 'quill_extra_options', function (OptionsResolver $extraResolver): void {
            $this->configBuilder->configureExtraOptions($extraResolver);
        });

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
}
