/**
 * Kandi-Labs site configuration
 * ---------------------------------------------------------------
 * This is the ONLY file you need to edit to change where links go,
 * add social accounts, or drop in product photos / 3D models.
 *
 * Paths that start with "/" are added to `shopUrl`.
 * Full URLs (starting with https://) are used exactly as written.
 */
window.KANDI_CONFIG = {
  /* Your Shopify storefront. Swap to a custom domain later,
     e.g. "https://shop.kandi-labs.com" */
  shopUrl: "https://kandi-labs.myshopify.com",

  links: {
    shop: "/",                              // Shop Now / Enter the Shop
    shopAll: "/collections/all",
    customizable: "/collections/customizable",
    contact: "/pages/contact",

    /* What We Make: product categories.
       Change each handle to match the collection URL in Shopify admin. */
    collections: {
      kandi: "/collections/kandi",
      sprouts: "/collections/sprouts",
      totems: "/collections/totems",
      trinkets: "/collections/trinkets",
      necklaces: "/collections/necklaces"
    },

    /* The Kandi-Labs Series */
    series: {
      paperTheater: "/collections/paper-theater",
      headlinerz: "/collections/headlinerz"
    },

    /* Find Your Frequency: browse pages.
       These point at the theme's browse view (templates/index.browse.json). */
    browse: {
      artist: "/?view=browse#artists",
      festival: "/?view=browse#events",
      series: "/?view=browse#series"
    }
  },

  /* Social accounts: leave "" to hide. Add as many as you like.
     Example: { label: "Instagram", url: "https://instagram.com/kandilabs" } */
  social: [
    // { label: "Instagram", url: "" },
    // { label: "TikTok", url: "" }
  ],

  /* Optional contact email shown in the footer ("" to hide). */
  email: "",

  /* Product imagery and 3D models.
     Keys match data-media="..." in index.html. Leave blank to keep the placeholder.
     image: path to a local image (e.g. "assets/img/products/kandi.webp")
     glb:   path to a .glb model (e.g. "assets/models/cry-wachi.glb"); when set,
            an interactive 3D preview loads in place of the image. */
  media: {
    kandi:        { image: "", alt: "", glb: "" },
    sprouts:      { image: "", alt: "", glb: "" },
    totems:       { image: "", alt: "", glb: "" },
    trinkets:     { image: "", alt: "", glb: "" },
    necklaces:    { image: "", alt: "", glb: "" },
    paperTheater: { image: "", alt: "", glb: "" },
    headlinerz:   { image: "", alt: "", glb: "" }
  },

  /* 3D viewer used only when a `glb` above is filled in.
     Nothing is downloaded unless a model is configured. */
  modelViewerSrc: "https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"
};
