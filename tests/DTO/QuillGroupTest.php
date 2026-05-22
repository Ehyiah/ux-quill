<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO;

use Ehyiah\QuillJsBundle\DTO\Fields\BlockField\ColorField;
use Ehyiah\QuillJsBundle\DTO\Fields\BlockField\HeaderGroupField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\BoldField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\CleanField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\CodeBlockField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\FormulaField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\ImageField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\ItalicField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\LinkField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\TableField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\VideoField;
use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillBlockFieldInterface;
use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillInlineFieldInterface;
use Ehyiah\QuillJsBundle\DTO\QuillGroup;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\QuillGroup
 */
class QuillGroupTest extends TestCase
{
    /**
     * @covers ::build
     */
    public function testBuild(): void
    {
        $boldInlineField = new BoldField();
        $italicInlineField = new ItalicField();
        $colorBlockField = new ColorField('green');
        $headerBlockField = new HeaderGroupField(HeaderGroupField::HEADER_OPTION_1, HeaderGroupField::HEADER_OPTION_3);

        $result = QuillGroup::build($boldInlineField, $italicInlineField, $colorBlockField, $headerBlockField);

        $this->assertCount(4, $result);
        $this->assertInstanceOf(BoldField::class, $result[0]);
        $this->assertInstanceOf(ItalicField::class, $result[1]);
        $this->assertInstanceOf(ColorField::class, $result[2]);
        $this->assertInstanceOf(HeaderGroupField::class, $result[3]);
    }

    /**
     * @covers ::buildMinimal
     */
    public function testBuildMinimal(): void
    {
        $result = QuillGroup::buildMinimal();

        $this->assertCount(5, $result);
        $this->assertContainsOnlyFieldInstances($result);
        $this->assertContainsFieldOfClass(BoldField::class, $result);
        $this->assertContainsFieldOfClass(ItalicField::class, $result);
        $this->assertContainsFieldOfClass(LinkField::class, $result);
        $this->assertContainsFieldOfClass(CleanField::class, $result);
    }

    /**
     * @covers ::buildForNewsletter
     */
    public function testBuildForNewsletter(): void
    {
        $result = QuillGroup::buildForNewsletter();

        $this->assertContainsOnlyFieldInstances($result);
        $this->assertContainsFieldOfClass(BoldField::class, $result);
        $this->assertContainsFieldOfClass(LinkField::class, $result);
        $this->assertContainsFieldOfClass(HeaderGroupField::class, $result);
        $this->assertContainsFieldOfClass(ImageField::class, $result);

        // Newsletter preset must NOT contain technical fields.
        $this->assertDoesNotContainFieldOfClass(CodeBlockField::class, $result);
        $this->assertDoesNotContainFieldOfClass(FormulaField::class, $result);
        $this->assertDoesNotContainFieldOfClass(TableField::class, $result);
        $this->assertDoesNotContainFieldOfClass(VideoField::class, $result);
    }

    /**
     * @covers ::buildForBlog
     */
    public function testBuildForBlog(): void
    {
        $result = QuillGroup::buildAdvanced();

        $this->assertContainsOnlyFieldInstances($result);
        $this->assertContainsFieldOfClass(BoldField::class, $result);
        $this->assertContainsFieldOfClass(HeaderGroupField::class, $result);
        $this->assertContainsFieldOfClass(ImageField::class, $result);
        $this->assertContainsFieldOfClass(VideoField::class, $result);
        $this->assertContainsFieldOfClass(CodeBlockField::class, $result);
        $this->assertContainsFieldOfClass(TableField::class, $result);

        // Blog preset deliberately excludes very specialised fields.
        $this->assertDoesNotContainFieldOfClass(FormulaField::class, $result);
    }

    /**
     * @param array<mixed> $fields
     */
    private function assertContainsOnlyFieldInstances(array $fields): void
    {
        foreach ($fields as $field) {
            $this->assertThat(
                $field instanceof QuillBlockFieldInterface || $field instanceof QuillInlineFieldInterface,
                $this->isTrue(),
                sprintf('Expected a Quill field instance, got %s', get_debug_type($field))
            );
        }
    }

    /**
     * @param class-string $class
     * @param array<mixed> $fields
     */
    private function assertContainsFieldOfClass(string $class, array $fields): void
    {
        foreach ($fields as $field) {
            if ($field instanceof $class) {
                $this->addToAssertionCount(1);

                return;
            }
        }

        $this->fail(sprintf('Expected to find an instance of %s in the preset.', $class));
    }

    /**
     * @param class-string $class
     * @param array<mixed> $fields
     */
    private function assertDoesNotContainFieldOfClass(string $class, array $fields): void
    {
        foreach ($fields as $field) {
            if ($field instanceof $class) {
                $this->fail(sprintf('Did not expect to find an instance of %s in the preset.', $class));
            }
        }

        $this->addToAssertionCount(1);
    }
}
