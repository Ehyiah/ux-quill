<?php

namespace Ehyiah\QuillJsBundle\Tests\DependencyInjection;

use Ehyiah\QuillJsBundle\Config\QuillConfigBuilder;
use Ehyiah\QuillJsBundle\DependencyInjection\QuillJsExtension;
use PHPUnit\Framework\TestCase;
use Symfony\Component\DependencyInjection\ContainerBuilder;

/**
 * @covers \Ehyiah\QuillJsBundle\DependencyInjection\QuillJsExtension
 */
final class QuillJsExtensionTest extends TestCase
{
    public function testQuillConfigBuilderIsAliasedForAutowiring(): void
    {
        $container = new ContainerBuilder();
        $container->setParameter('kernel.bundles', []);
        $extension = new QuillJsExtension();

        $extension->load([], $container);

        $this->assertTrue($container->hasAlias(QuillConfigBuilder::class));
        $this->assertSame('quill_js.config_builder', (string)$container->getAlias(QuillConfigBuilder::class));
    }
}
