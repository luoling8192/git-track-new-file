# Git Track New File

Automatically add new files to git when created in workspace

## Configuration

You can customize the extension behavior in VS Code settings:

```json
{
  "gitTrackNewFile.showNotifications": false,
  "gitTrackNewFile.excludePatterns": ["*.tmp", "temp/*"]
}
```

## Known Issues

- Only works with files created through VS Code (not external file system changes)
- Basic gitignore pattern matching (complex patterns may not work perfectly)

## Release Notes

### 0.0.1

Initial release with core functionality:
- Auto-add new files to git
- Respect gitignore patterns
- Toast notifications
- Multi-workspace support

---

## Contributing

Found a bug or have a feature request? Please open an issue on [GitHub](https://github.com/luoling8192/git-track-new-file/issues).

## License

This extension is licensed under the [MIT License](LICENSE).

**Enjoy effortless git file tracking!**
