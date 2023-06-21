# Skeleton Bundle

🗺 The skeleton bundle is a skeleton to use when you want to create a open source bundle.

⚡️ Big thanks to [mtarld](https://github.com/mtarld) for the inspiration, anytime I create a bundle I see what is done in his library https://github.com/mtarld/api-platform-ms-bundle. 👀

💡 At some point, I decided to create a skeleton to avoid copy/paste and to have a base to start with.

🗣 You can clone this repository and remove the .git folder to start your own bundle. Obviously you should adapt the code to fit your needs.

🫵 If this skeleton is not up to date, please create an issue or a pull request to update it.

🤝 If this skeleton helped you, please give it a star and tell me on twitter [@SmaineDev](https://twitter.com/@SmaineDev)

#### Table of contents
- [Inside the skeleton](#Inside-the-skeleton)
- [Create the README for the Bundle](#The-Foo-Bundle)
- [Publishing the bundle on packagist](#Publishing-the-bundle-on-packagist)

-----------------

# Inside-the-skeleton

You'll find a:
- `main.yaml.dist` file in the `.github/workflows` folder. You should remove the `.dist` extension to trigger the github action.
- `Makefile` with some useful commands to run tests and quality tools.
- `src` directory where the core bundle classes can live.
- `FooBundle.php` with classic instructions to configure a bundle.
- `services.php` for configuring the "static" bundle services.
- `tests` folder with an AppKernel and a config file to setup a Symfony app in order to test the bundle. 

-----------------

# The Foo Bundle

A Symfony Bundle to [explain the purpose of the bundle here].

## Getting started
### Installation
You can easily install [Foo] bundle by composer
```
$ composer require <namespace>/foo-bundle
```
Then, bundle should be registered. Just verify that `config\bundles.php` is containing :
```php
Namespace\FooBundle\FooBundle::class => ['all' => true],
```

### Configuration
Then, you should register it in the configuration (`config/packages/foo_lib.yaml`) :
```yaml
# config/packages/foo_lib.yaml
    foo_lib:
        # required
        foo: 'bar'
        # optional
        baz: 
          - 'qux'
          - 'quux'
          - 'quuz'
```

### Usage

You can register a new foo service with implementing `FooInterface` or adding a tag `foo_lib.foo` if you don't use the autoconfiguration.

```yaml
# config/services.yaml
services:
    # Register a new foo service
    Namespace\FooBundle\Foo:
        tags: ['foo_lib.foo']
```

```php
class FooCustom implements FooInterface
{
    public function foo(): string
    {
        return 'bar';
    }
}
```

## Contributing
Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

After writing your fix/feature, you can run following commands to make sure that everything is still ok.

```bash
# Install dev dependencies
$ composer install

# Running tests and quality tools locally
$ make all
```

## Authors
- John Doe - [JohnDoe](https://github.com/johndoe) - <john(dot)doe@email(dot)com>

-----------------

## Publishing the bundle to be used by other developers through composer

1- Create the release on the repository
- Go to https://github.com/[pseudo]/[the-lib]/releases/new
- "Choose a tag" read carefully the Tagging suggestions.

2- Create the package on packagist
- Go to https://packagist.org/packages/submit
- Enter the github repository url
- Click on "Check"
- Click on "Submit"
- Make the package auto-updatable by clicking on "Enable auto-updates" so you don't have to do it manually each time you create a new release.

3- Create the Symfony Recipe to be able to use the bundle with Symfony Flex and configure the bundle directly with composer
- Go to https://github.com/symfony/recipes-contrib/
- Fork the repository
- Clone the repository and create a pull request with the recipe [like this](https://github.com/symfony/recipes-contrib/pull/1102/files) for your bundle.
