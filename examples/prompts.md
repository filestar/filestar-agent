# Example prompts

Things to ask an agent once Filestar is added. Each one works with the MCP server or the skill.

1. "Convert `IMG_0042.heic` to JPG and put it in ~/Pictures."
2. "What is `drawing.dwg`? Make me a PDF of it."
3. "Turn `part.step` into a glTF I can open in a browser."
4. "Open `assembly.jt` and convert it to GLB."
5. "Convert this embroidery file `logo.dst` to a PNG so I can see the design."
6. "Extract the audio of `talk.mp4` as MP3."
7. "Compress `presentation.pdf` and tell me how much smaller it got."
8. "Resize all PNGs in `./screenshots` to 1280 pixels wide and save them as WebP." (more than one file per run needs a plan)
9. "This `.psd` won't open. Convert it to PNG."
10. "I have an old WordPerfect file, `letter.wpd`. Turn it into a Word document."

Tips:

- Say where the output should go; Filestar never overwrites a file unless asked.
- Say "keep it on this computer" when files must not leave it. Through MCP that is already the default.
- The agent can ask Filestar what it can do with a file first ("which formats can `scene.blend` be converted to?").
