<?php

namespace Ehyiah\QuillJsBundle\Tests\Twig;

use Ehyiah\QuillJsBundle\Twig\QuillContentExtension;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\Twig\QuillContentExtension
 */
final class QuillContentExtensionTest extends TestCase
{
    /**
     * @covers ::renderScripts
     */
    public function testRenderScriptsEmitsTheMapsControllerElement(): void
    {
        $extension = new QuillContentExtension();

        $output = $extension->renderScripts();

        $this->assertSame(
            '<div data-controller="ehyiah--ux-quill--quill-maps" hidden></div>',
            $output,
        );
    }

    /**
     * @covers ::renderScripts
     */
    public function testRenderScriptsIsIdempotentPerRequest(): void
    {
        $extension = new QuillContentExtension();

        $extension->renderScripts();
        $output = $extension->renderScripts();

        $this->assertSame('', $output);
    }
}
