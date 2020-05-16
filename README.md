# JVM Tools for VS Code

This is the very first preview release of JVM Tools for VS Code.

## Features

1. List running JVMs with `jps`.
1. Starts `jconsole` on the selected JVM.

## Requirements

You must have a JDK installed.

## Extension Settings

No settings at this stage.

## Known Issues

Not really.

## Release Notes

See [CHANGELOG](./CHANGELOG.md) for details.

## Roadmap

What else will this extension eventually do?

1. Get snapshot of JVM status
1. Start debugging selected JVM
1. Start/Stop/Dump JDK Flight Recorder
1. Perform a Thread Dump
1. Start/Stop recording GC log

### Useful resources

- https://dzone.com/articles/turning-gc-logging-runtime

#### Start JFR

    java -XX:StartFlightRecording=duration=30s,settings=profile,filename=leak.jfr MemoryLeak

    jcmd 1 JFR.start duration=30s settings=profile filename=path/filename.jfr

# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
