export function generateMarketingAssets(listing, business) {
  const price = listing.price ? `${listing.currency || "NGN"} ${Number(listing.price).toLocaleString()}` : "Contact for price";
  const features = listing.features?.slice(0, 4).join(", ") || "premium features";
  const url = `${process.env.FRONTEND_URL || "http://localhost:3000"}/campaign/${listing.slug}`;
  const contact = listing.whatsapp || listing.contactPhone || business.whatsapp || business.phone || "";
  const base = `${listing.title} in ${listing.location || "a prime location"} for ${price}. Features include ${features}.`;

  return {
    headline: `${listing.title} now available`,
    longDescription: `${base} Explore the campaign page, view photos, and send an inquiry directly to ${business.name}.`,
    cta: "Book an inspection or send an inquiry today",
    facebook: `${base}\n\nSee details: ${url}\nContact: ${contact}`,
    instagram: `${listing.title}\n${price}\n${listing.location || ""}\n\n${features}\n\nTap the link to inquire: ${url}`,
    whatsapp: `Hello, ${business.name} is marketing ${listing.title}.\n\n${base}\n\nView page: ${url}\nContact: ${contact}`,
    x: `${listing.title} - ${price}. ${listing.location || ""}. View and inquire: ${url}`,
    linkedin: `${business.name} presents ${listing.title}. ${base} View the full campaign and performance-ready details: ${url}`,
    email: `Subject: ${listing.title} is available\n\n${base}\n\nView the campaign page here: ${url}\n\n${contact ? `Contact: ${contact}` : ""}`,
    previewCard: {
      title: listing.title,
      price,
      location: listing.location,
      image: listing.images?.[0]?.url,
      brandColor: business.brandColor || "#0f766e"
    }
  };
}
