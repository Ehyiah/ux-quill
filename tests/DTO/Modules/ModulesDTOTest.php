<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Modules;

use Ehyiah\QuillJsBundle\DTO\Modules\AutosaveModule;
use Ehyiah\QuillJsBundle\DTO\Modules\DividerModule;
use Ehyiah\QuillJsBundle\DTO\Modules\ImageAttributesModule;
use Ehyiah\QuillJsBundle\DTO\Modules\LinkAttributesModule;
use Ehyiah\QuillJsBundle\DTO\Modules\MarkdownModule;
use Ehyiah\QuillJsBundle\DTO\Modules\MentionModule;
use Ehyiah\QuillJsBundle\DTO\Modules\PageBreakModule;
use PHPUnit\Framework\TestCase;

/**
 * @coversNothing
 */
class ModulesDTOTest extends TestCase
{
    public function testAutosaveModule(): void
    {
        $module = new AutosaveModule();
        $this->assertEquals('autosave', $module->name);
        $this->assertEquals(2000, $module->options['interval']);
        $this->assertEquals('manual', $module->options['restore_type']);

        $module = new AutosaveModule(options: ['interval' => 5000, 'restore_type' => 'auto']);
        $this->assertEquals(5000, $module->options['interval']);
        $this->assertEquals('auto', $module->options['restore_type']);
    }

    public function testDividerModule(): void
    {
        $module = new DividerModule();
        $this->assertEquals('divider', $module->name);
        $this->assertEquals([], $module->options);
    }

    public function testMarkdownModule(): void
    {
        $module = new MarkdownModule();
        $this->assertEquals('markdown', $module->name);
        $this->assertEquals([], $module->options);
    }

    public function testPageBreakModule(): void
    {
        $module = new PageBreakModule();
        $this->assertEquals('pageBreak', $module->name);
        $this->assertEquals(['label' => 'Page Break'], $module->options);

        $module = new PageBreakModule(options: ['label' => 'Saut de page']);
        $this->assertEquals(['label' => 'Saut de page'], $module->options);
    }

    public function testImageAttributesModule(): void
    {
        $module = new ImageAttributesModule();
        $this->assertEquals('imageAttributes', $module->name);
        $this->assertEquals([], $module->options);
    }

    public function testLinkAttributesModule(): void
    {
        $module = new LinkAttributesModule();
        $this->assertEquals('linkAttributes', $module->name);
        $this->assertEquals([], $module->options);
    }

    public function testMentionModule(): void
    {
        $module = new MentionModule();
        $this->assertEquals('mention', $module->name);
        $this->assertEquals('@', $module->options['trigger']);

        $module = new MentionModule('mention-tags', ['trigger' => '#']);
        $this->assertEquals('mention-tags', $module->name);
        $this->assertEquals('#', $module->options['trigger']);
        $this->assertEquals(10, $module->options['max_results']);
    }
}
