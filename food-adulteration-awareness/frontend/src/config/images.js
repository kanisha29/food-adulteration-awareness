// All remote images live here. Replace any URL with a local file, e.g.
//   import home from "../assets/home.jpg";  ->  home: home
// (put your files in src/assets/). If an image fails to load, a green gradient shows instead.
const u = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1800&q=70`;

export const IMAGES = {
  home: u("photo-1542838132-92c53300491e"),
  login: u("photo-1498837167922-ddd27525d352"),
  register: u("photo-1490645935967-10de6ba17061"),
  dashboard: u("photo-1488459716781-31db52582fe9"),
  checker: u("photo-1596040033229-a9821ebd058d"),
  foods: u("photo-1506368249639-73a05d6f6488"),
  analysis: u("photo-1532187863486-abf9dbad1b69"),
  awareness: u("photo-1556909114-f6e7ad7d3136"),
  report: u("photo-1576867757603-05b134ebc379"),
  admin: u("photo-1582719478250-c89cae4dc85b"),
};

export const bg = (url, from = "rgba(10,48,34,.88)", to = "rgba(10,48,34,.55)") => ({
  backgroundImage: `linear-gradient(105deg, ${from}, ${to}), url("${url}")`,
});
