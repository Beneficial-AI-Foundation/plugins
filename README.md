# Beneficial AI Foundation plugins

This repository is the official plugin marketplace for the Beneficial AI Foundation. It is a
catalog: each plugin remains versioned and released in its own source repository, while these
manifests point both Claude Code and Codex at an immutable release tag and commit.

## Available plugins

| Plugin | Description | Current release |
| --- | --- | --- |
| `fvs` | Formal Verification Skills for Lean 4 | `v2.2.1` |

## Claude Code

Add the marketplace once and install FVS:

```sh
claude plugin marketplace add Beneficial-AI-Foundation/plugins
claude plugin install fvs@beneficial-ai-foundation
```

Start a fresh Claude Code session and run:

```text
/fvs:help
```

Refresh the catalog and update FVS after a release:

```sh
claude plugin marketplace update beneficial-ai-foundation
claude plugin update fvs@beneficial-ai-foundation
```

Remove FVS and, if no BAIF plugins remain installed, the marketplace:

```sh
claude plugin uninstall fvs@beneficial-ai-foundation
claude plugin marketplace remove beneficial-ai-foundation
```

Use `claude plugin list --json` to inspect the installed version and source.

## Codex

Add the marketplace once and install FVS:

```sh
codex plugin marketplace add Beneficial-AI-Foundation/plugins
codex plugin add fvs@beneficial-ai-foundation
```

Start a fresh Codex session and run:

```text
$fvs:help
```

Refresh the catalog and reinstall FVS after a release:

```sh
codex plugin marketplace upgrade beneficial-ai-foundation
codex plugin add fvs@beneficial-ai-foundation
```

Remove FVS and, if no BAIF plugins remain installed, the marketplace:

```sh
codex plugin remove fvs@beneficial-ai-foundation
codex plugin marketplace remove beneficial-ai-foundation
```

Use `codex plugin list --json` to inspect the installed version and source.

## Release model

Every catalog entry uses a `git-subdir` source with both a semantic release tag and its full
40-character commit SHA. The SHA is the immutable source pin. Plugin code is not copied into this
repository.

The Claude command namespace is `/fvs:*`; the Codex skill namespace is `$fvs:*`. The marketplace
selector `fvs@beneficial-ai-foundation` identifies where to install the plugin from and does not
change either runtime namespace.

This Git marketplace can contain multiple BAIF plugins. It is separate from OpenAI's universal
public Plugins Directory, which has its own optional submission and review workflow.

## Validation

```sh
node scripts/validate-catalogs.cjs
claude plugin validate . --strict
```

## License

The catalog metadata and supporting files in this repository are released under the MIT License.
