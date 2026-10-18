# GitHub and Vercel

Keep the entire project together in your private `T-rex-G/Form-Atlas-Atelier` repository. Include the media, prompts, source files, builder and generated files. Do not upload the ZIP into the repository; upload its extracted contents.

## Vercel import

1. Import that private GitHub repository into Vercel.
2. Select the folder containing `vercel.json` as the project root. With the extracted contents at repository root, leave Root Directory empty.
3. Use the included configuration: framework **Other**, build command `node builder/export_static.cjs`, output directory `dist`, no install command and no environment variables.
4. Configure Vercel Authentication under Deployment Protection for every environment you intend to keep private, including production. A private GitHub repository does not make the deployed website private. Check access in a signed-out browser before sharing the URL.
5. Deploy when ready. This configuration was exported and tested locally; an actual Vercel deployment has not been run.

For updates, run `python3 builder/build.py` and `python3 builder/verify.py`, then commit the complete rebuilt project. The Vercel build checks the manifest before exporting, and fails with a clear rebuild instruction if tracked files changed after the HTML was generated.

Personal notes, bookmarks and additions stay in the browser. Hosting does not sync them between devices; export a personal backup to move them. No authentication system, database or cloud synchronization is embedded in the static app.

The collection contains approximately 300 MB of source media. Vercel documents a 100 MB source-upload limit for Hobby CLI uploads; Git import is the prepared path here. This is not a claim that every deployment plan or account has been validated for this project.

Official references: [Git imports](https://vercel.com/docs/git), [Vercel Authentication](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication), [platform limits](https://vercel.com/docs/limits).
