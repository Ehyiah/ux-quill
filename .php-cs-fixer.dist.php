<?php

$finder = PhpCsFixer\Finder::create()
    ->notPath('bootstrap.php')
    ->in(__DIR__ . '/src')
    ->in(__DIR__ . '/tests')
;

return (new \PhpCsFixer\Config())
    ->setRiskyAllowed(true)
    ->setRules([
           '@PhpCsFixer' => true,
           '@DoctrineAnnotation' => true,
           '@PHP71Migration' => true,
           '@Symfony' => true,
           '@Symfony:risky' => true,
           'cast_spaces' => ['space' => 'none'],
           'concat_space' => ['spacing' => 'one'],
           'escape_implicit_backslashes' => false,
           'explicit_indirect_variable' => false,
           'explicit_string_variable' => false,
           'no_superfluous_elseif' => false,
           'ordered_class_elements' => false,
           'php_unit_internal_class' => false,
           'phpdoc_order_by_value' => false,
           'phpdoc_align' => ['align' => 'left'],
           'phpdoc_summary' => false,
           'phpdoc_types_order' => ['null_adjustment' => 'always_last', 'sort_algorithm' => 'none'],
           'simple_to_complex_string_variable' => false,
           'native_constant_invocation' => false,
           'native_function_invocation' => false,
           'general_phpdoc_annotation_remove' => ['annotations' => ['author', 'package']],
           'global_namespace_import' => true,
           'linebreak_after_opening_tag' => true,
           'no_php4_constructor' => true,
           'pow_to_exponentiation' => true,
           'random_api_migration' => true,
           'list_syntax' => ['syntax' => 'short'],
           'method_chaining_indentation' => false,
       ])
    ->setFinder($finder)
    ;
