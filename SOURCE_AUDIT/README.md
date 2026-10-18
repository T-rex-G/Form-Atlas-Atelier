# Source access audit — 18 October 2026

Resolved **344 of the 454 previously unverified labels**. Access was matched by exact publisher identity, exact title and creator, original registry IDs, or an observed named-library association. Similar titles from different creators or section types are left unverified.

| Source | Free access | Paid source / membership | Unverified current access |
| --- | ---: | ---: | ---: |
| MotionSites AI | 148 | 239 | 96 |
| HorizonX | 0 | 93 | 0 |
| 21st.dev | 84 limited | 0 | 9 |
| Superdesign | 139 public prompts | 0 | 5 |
| Included MIT code studies | 52 | 0 | 0 |
| **Total** | **423** | **332** | **110** |

## What the labels mean

**MotionSites AI:** checked 585 public catalog records and 122 published frontend records, which overlap the same 585 source identities. Free/paid uses the exact source record's access flag. The complete supplied prompt at Atlas 79 identifies 3D Jack Portfolio by exact publisher ID; its old catalog label was ClearInvoice SaaS Hero1. Its retained character image is disclosed as archived imagery. Similar words across a hero, pricing section, footer or service section are not an identity match.

**HorizonX:** all 93 entries were matched to selected product pages in the current 290-product catalog. Each selected product's membership rule requires a paid membership for editable Figma/code downloads. The numeric price field can be zero while membership is required. The premium download tier is also separate from free/paid access. Nine renamed entries were matched through their exact original name in the publisher's own asset directory.

**Superdesign:** 139 exact-title public design prompts were returned anonymously by the site's public prompt-library service, with public status and a nonempty prompt. Prompt length and SHA-256 are retained as evidence; no new full prompt text was bundled. Five generic guides have no matching published design prompt.

**21st.dev:** 84 exact community-component identities were confirmed through public catalog metadata or the selected public component page. Original creator IDs and publisher asset paths resolve renamed handles; observed library brands resolve the Motion Primitives and Magic UI aliases. The public browser policy reported a two-copy allowance for non-members on 18 October. Unlimited copies require paid membership, and registry retrieval requires sign-in. “Free · limited” describes access on 21st.dev; the saved offline prompt has no two-copy limit. Publisher component licences are recorded separately where available. No authenticated registry source was retrieved. Nine unresolved creator/component pairs remain in the review list.

**Included code:** the 52 existing code studies retain their complete MIT source files, notices and local demonstrations.

## Evidence and remaining work

Open a reference's **About this reference** section to see the access rule, check date and source identity. `ACCESS_EVIDENCE.json` contains every entry's factual access basis. Root `ACCESS_CATALOG.csv` lists all 865 entries and separates source licences from bundled-code licences. `UNVERIFIED_ITEMS.csv` lists all 110 unresolved entries, their original identities and any supplied historical free/paid flag.

The 196 MotionSites records explicitly marked free include 147 distinct records matched to saved entries (148 Atlas entries because an original identity is duplicated). `MISSING_FREE_ITEMS.csv` contains 49 pending source records: 48 missing titles and one separate Portal identity review. This index contains metadata, not complete designs or prompt packs.

Free access does not grant a redistribution licence. The publisher's recorded terms restrict bulk copying and redistribution of prompt/code content, so no missing MotionSites prompt text was downloaded or bundled. All 865 supplied prompt files and all existing code, demonstration, licence, image and video bytes are preserved. Source access can change after its check date.

The app has no remote runtime dependencies. Full research URLs are not added as outbound MotionSites links in the interface.
