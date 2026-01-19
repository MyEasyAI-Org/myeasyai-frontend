// Lista de cidades europeias por pais/regiao para dropdown
// Principais paises europeus (exceto Portugal que tem arquivo separado)

export const EUROPE_COUNTRIES = [
  { code: 'ES', name: 'Espanha' },
  { code: 'FR', name: 'Franca' },
  { code: 'DE', name: 'Alemanha' },
  { code: 'IT', name: 'Italia' },
  { code: 'GB', name: 'Reino Unido' },
  { code: 'NL', name: 'Holanda' },
  { code: 'BE', name: 'Belgica' },
  { code: 'CH', name: 'Suica' },
  { code: 'AT', name: 'Austria' },
  { code: 'IE', name: 'Irlanda' },
] as const;

export type EuropeCountryCode = (typeof EUROPE_COUNTRIES)[number]['code'];

// Espanha - Comunidades Autonomas
export const SPAIN_REGIONS = [
  { code: 'AN', name: 'Andalucia' },
  { code: 'AR', name: 'Aragon' },
  { code: 'AS', name: 'Asturias' },
  { code: 'IB', name: 'Islas Baleares' },
  { code: 'CN', name: 'Canarias' },
  { code: 'CB', name: 'Cantabria' },
  { code: 'CL', name: 'Castilla y Leon' },
  { code: 'CM', name: 'Castilla-La Mancha' },
  { code: 'CT', name: 'Cataluna' },
  { code: 'EX', name: 'Extremadura' },
  { code: 'GA', name: 'Galicia' },
  { code: 'MD', name: 'Madrid' },
  { code: 'MC', name: 'Murcia' },
  { code: 'NC', name: 'Navarra' },
  { code: 'PV', name: 'Pais Vasco' },
  { code: 'RI', name: 'La Rioja' },
  { code: 'VC', name: 'Valencia' },
] as const;

export const SPAIN_CITIES: Record<string, string[]> = {
  AN: ['Sevilla', 'Malaga', 'Cordoba', 'Granada', 'Almeria', 'Cadiz', 'Huelva', 'Jaen', 'Jerez de la Frontera', 'Marbella'],
  AR: ['Zaragoza', 'Huesca', 'Teruel', 'Calatayud', 'Utebo', 'Monzon', 'Barbastro', 'Ejea de los Caballeros', 'Jaca', 'Tarazona'],
  AS: ['Oviedo', 'Gijon', 'Aviles', 'Siero', 'Langreo', 'Mieres', 'Castrillon', 'San Martin del Rey Aurelio', 'Corvera de Asturias', 'Villaviciosa'],
  IB: ['Palma de Mallorca', 'Ibiza', 'Manacor', 'Inca', 'Ciutadella de Menorca', 'Llucmajor', 'Marratxi', 'Santa Eulalia del Rio', 'Mahon', 'Calvia'],
  CN: ['Las Palmas de Gran Canaria', 'Santa Cruz de Tenerife', 'San Cristobal de La Laguna', 'Telde', 'Arona', 'Santa Lucia de Tirajana', 'Arrecife', 'Adeje', 'La Orotava', 'Puerto de la Cruz'],
  CB: ['Santander', 'Torrelavega', 'Camargo', 'Castro Urdiales', 'Piélagos', 'El Astillero', 'Laredo', 'Santa Cruz de Bezana', 'Los Corrales de Buelna', 'Santoña'],
  CL: ['Valladolid', 'Burgos', 'Salamanca', 'Leon', 'Palencia', 'Zamora', 'Avila', 'Segovia', 'Soria', 'Ponferrada'],
  CM: ['Albacete', 'Toledo', 'Ciudad Real', 'Guadalajara', 'Cuenca', 'Talavera de la Reina', 'Puertollano', 'Tomelloso', 'Hellin', 'Alcazar de San Juan'],
  CT: ['Barcelona', 'L Hospitalet de Llobregat', 'Terrassa', 'Badalona', 'Sabadell', 'Lleida', 'Tarragona', 'Mataro', 'Santa Coloma de Gramenet', 'Reus'],
  EX: ['Badajoz', 'Caceres', 'Merida', 'Plasencia', 'Don Benito', 'Almendralejo', 'Villanueva de la Serena', 'Navalmoral de la Mata', 'Zafra', 'Montijo'],
  GA: ['Vigo', 'A Coruna', 'Ourense', 'Santiago de Compostela', 'Lugo', 'Pontevedra', 'Ferrol', 'Vilagarcia de Arousa', 'Narón', 'Oleiros'],
  MD: ['Madrid', 'Mostoles', 'Alcala de Henares', 'Fuenlabrada', 'Leganes', 'Getafe', 'Alcorcon', 'Torrejon de Ardoz', 'Parla', 'Alcobendas'],
  MC: ['Murcia', 'Cartagena', 'Lorca', 'Molina de Segura', 'Alcantarilla', 'Torre-Pacheco', 'Aguilas', 'Cieza', 'Yecla', 'San Javier'],
  NC: ['Pamplona', 'Tudela', 'Barañain', 'Burlada', 'Estella', 'Zizur Mayor', 'Tafalla', 'Ansoain', 'Villava', 'Berriozar'],
  PV: ['Bilbao', 'Vitoria-Gasteiz', 'San Sebastian', 'Barakaldo', 'Getxo', 'Irun', 'Portugalete', 'Santurtzi', 'Basauri', 'Leioa'],
  RI: ['Logroño', 'Calahorra', 'Arnedo', 'Haro', 'Alfaro', 'Lardero', 'Najera', 'Santo Domingo de la Calzada', 'Rincon de Soto', 'Villamediana de Iregua'],
  VC: ['Valencia', 'Alicante', 'Elche', 'Castellon de la Plana', 'Torrevieja', 'Orihuela', 'Gandia', 'Benidorm', 'Alcoy', 'Sagunto'],
};

// Franca - Regioes
export const FRANCE_REGIONS = [
  { code: 'IDF', name: 'Ile-de-France' },
  { code: 'ARA', name: 'Auvergne-Rhone-Alpes' },
  { code: 'NAQ', name: 'Nouvelle-Aquitaine' },
  { code: 'OCC', name: 'Occitanie' },
  { code: 'PAC', name: 'Provence-Alpes-Cote d Azur' },
  { code: 'GES', name: 'Grand Est' },
  { code: 'HDF', name: 'Hauts-de-France' },
  { code: 'PDL', name: 'Pays de la Loire' },
  { code: 'BRE', name: 'Bretagne' },
  { code: 'NOR', name: 'Normandie' },
] as const;

export const FRANCE_CITIES: Record<string, string[]> = {
  IDF: ['Paris', 'Boulogne-Billancourt', 'Saint-Denis', 'Argenteuil', 'Montreuil', 'Nanterre', 'Vitry-sur-Seine', 'Creteil', 'Versailles', 'Colombes'],
  ARA: ['Lyon', 'Grenoble', 'Saint-Etienne', 'Villeurbanne', 'Clermont-Ferrand', 'Annecy', 'Valence', 'Chambery', 'Bron', 'Venissieux'],
  NAQ: ['Bordeaux', 'Limoges', 'Poitiers', 'Merignac', 'Pessac', 'Pau', 'La Rochelle', 'Angouleme', 'Bayonne', 'Niort'],
  OCC: ['Toulouse', 'Montpellier', 'Nimes', 'Perpignan', 'Beziers', 'Carcassonne', 'Narbonne', 'Ales', 'Tarbes', 'Sete'],
  PAC: ['Marseille', 'Nice', 'Toulon', 'Aix-en-Provence', 'Avignon', 'Antibes', 'Cannes', 'Hyeres', 'Frejus', 'Arles'],
  GES: ['Strasbourg', 'Reims', 'Metz', 'Mulhouse', 'Nancy', 'Colmar', 'Troyes', 'Charleville-Mezieres', 'Chalons-en-Champagne', 'Thionville'],
  HDF: ['Lille', 'Amiens', 'Roubaix', 'Tourcoing', 'Dunkerque', 'Villeneuve-d Ascq', 'Calais', 'Douai', 'Valenciennes', 'Wattrelos'],
  PDL: ['Nantes', 'Angers', 'Le Mans', 'Saint-Nazaire', 'La Roche-sur-Yon', 'Cholet', 'Laval', 'Saint-Herblain', 'Reze', 'Saumur'],
  BRE: ['Rennes', 'Brest', 'Quimper', 'Lorient', 'Vannes', 'Saint-Malo', 'Saint-Brieuc', 'Lanester', 'Fougeres', 'Concarneau'],
  NOR: ['Rouen', 'Le Havre', 'Caen', 'Cherbourg-en-Cotentin', 'Evreux', 'Dieppe', 'Saint-Etienne-du-Rouvray', 'Sotteville-les-Rouen', 'Alençon', 'Fecamp'],
};

// Alemanha - Estados Federais (Lander)
export const GERMANY_STATES = [
  { code: 'BW', name: 'Baden-Wurttemberg' },
  { code: 'BY', name: 'Bayern (Bavaria)' },
  { code: 'BE', name: 'Berlin' },
  { code: 'BB', name: 'Brandenburg' },
  { code: 'HB', name: 'Bremen' },
  { code: 'HH', name: 'Hamburg' },
  { code: 'HE', name: 'Hessen' },
  { code: 'NI', name: 'Niedersachsen' },
  { code: 'NW', name: 'Nordrhein-Westfalen' },
  { code: 'RP', name: 'Rheinland-Pfalz' },
  { code: 'SL', name: 'Saarland' },
  { code: 'SN', name: 'Sachsen' },
  { code: 'ST', name: 'Sachsen-Anhalt' },
  { code: 'SH', name: 'Schleswig-Holstein' },
  { code: 'TH', name: 'Thuringen' },
  { code: 'MV', name: 'Mecklenburg-Vorpommern' },
] as const;

export const GERMANY_CITIES: Record<string, string[]> = {
  BW: ['Stuttgart', 'Karlsruhe', 'Mannheim', 'Freiburg im Breisgau', 'Heidelberg', 'Ulm', 'Heilbronn', 'Pforzheim', 'Reutlingen', 'Esslingen am Neckar'],
  BY: ['Munchen', 'Nurnberg', 'Augsburg', 'Regensburg', 'Ingolstadt', 'Wurzburg', 'Furth', 'Erlangen', 'Bamberg', 'Bayreuth'],
  BE: ['Berlin'],
  BB: ['Potsdam', 'Cottbus', 'Brandenburg an der Havel', 'Frankfurt (Oder)', 'Oranienburg', 'Falkensee', 'Bernau bei Berlin', 'Eberswalde', 'Königs Wusterhausen', 'Schwedt/Oder'],
  HB: ['Bremen', 'Bremerhaven'],
  HH: ['Hamburg'],
  HE: ['Frankfurt am Main', 'Wiesbaden', 'Kassel', 'Darmstadt', 'Offenbach am Main', 'Hanau', 'Giessen', 'Marburg', 'Fulda', 'Russelheim am Main'],
  NI: ['Hannover', 'Braunschweig', 'Oldenburg', 'Osnabruck', 'Wolfsburg', 'Gottingen', 'Salzgitter', 'Hildesheim', 'Wilhelmshaven', 'Delmenhorst'],
  NW: ['Koln', 'Dusseldorf', 'Dortmund', 'Essen', 'Duisburg', 'Bochum', 'Wuppertal', 'Bielefeld', 'Bonn', 'Munster', 'Aachen', 'Gelsenkirchen'],
  RP: ['Mainz', 'Ludwigshafen am Rhein', 'Koblenz', 'Trier', 'Kaiserslautern', 'Worms', 'Neustadt an der Weinstrasse', 'Speyer', 'Frankenthal', 'Bad Kreuznach'],
  SL: ['Saarbrucken', 'Neunkirchen', 'Homburg', 'Volklingen', 'St. Ingbert', 'Saarlouis', 'Merzig', 'Sankt Wendel', 'Blieskastel', 'Dillingen/Saar'],
  SN: ['Leipzig', 'Dresden', 'Chemnitz', 'Zwickau', 'Plauen', 'Gorlitz', 'Freiberg', 'Bautzen', 'Pirna', 'Freital'],
  ST: ['Halle (Saale)', 'Magdeburg', 'Dessau-Rosslau', 'Lutherstadt Wittenberg', 'Stendal', 'Weissenfels', 'Bernburg', 'Merseburg', 'Halberstadt', 'Sangerhausen'],
  SH: ['Kiel', 'Lubeck', 'Flensburg', 'Neumunster', 'Norderstedt', 'Elmshorn', 'Pinneberg', 'Wedel', 'Itzehoe', 'Ahrensburg'],
  TH: ['Erfurt', 'Jena', 'Gera', 'Weimar', 'Gotha', 'Nordhausen', 'Eisenach', 'Suhl', 'Altenburg', 'Muhlhausen/Thuringen'],
  MV: ['Rostock', 'Schwerin', 'Neubrandenburg', 'Stralsund', 'Greifswald', 'Wismar', 'Gustrow', 'Waren (Muritz)', 'Parchim', 'Ribnitz-Damgarten'],
};

// Italia - Regioes
export const ITALY_REGIONS = [
  { code: 'LOM', name: 'Lombardia' },
  { code: 'LAZ', name: 'Lazio' },
  { code: 'CAM', name: 'Campania' },
  { code: 'SIC', name: 'Sicilia' },
  { code: 'VEN', name: 'Veneto' },
  { code: 'PIE', name: 'Piemonte' },
  { code: 'EMR', name: 'Emilia-Romagna' },
  { code: 'PUG', name: 'Puglia' },
  { code: 'TOS', name: 'Toscana' },
  { code: 'CAL', name: 'Calabria' },
] as const;

export const ITALY_CITIES: Record<string, string[]> = {
  LOM: ['Milano', 'Brescia', 'Bergamo', 'Monza', 'Como', 'Varese', 'Busto Arsizio', 'Sesto San Giovanni', 'Cinisello Balsamo', 'Pavia'],
  LAZ: ['Roma', 'Latina', 'Guidonia Montecelio', 'Fiumicino', 'Aprilia', 'Viterbo', 'Pomezia', 'Tivoli', 'Velletri', 'Anzio'],
  CAM: ['Napoli', 'Salerno', 'Giugliano in Campania', 'Torre del Greco', 'Caserta', 'Castellammare di Stabia', 'Portici', 'Ercolano', 'Afragola', 'Casoria'],
  SIC: ['Palermo', 'Catania', 'Messina', 'Siracusa', 'Marsala', 'Gela', 'Ragusa', 'Trapani', 'Caltanissetta', 'Agrigento'],
  VEN: ['Venezia', 'Verona', 'Padova', 'Vicenza', 'Treviso', 'Rovigo', 'Belluno', 'Chioggia', 'San Dona di Piave', 'Bassano del Grappa'],
  PIE: ['Torino', 'Novara', 'Alessandria', 'Asti', 'Moncalieri', 'Cuneo', 'Collegno', 'Rivoli', 'Nichelino', 'Settimo Torinese'],
  EMR: ['Bologna', 'Parma', 'Modena', 'Reggio nell Emilia', 'Ravenna', 'Rimini', 'Ferrara', 'Forli', 'Piacenza', 'Cesena'],
  PUG: ['Bari', 'Taranto', 'Foggia', 'Lecce', 'Andria', 'Barletta', 'Brindisi', 'Altamura', 'Molfetta', 'Cerignola'],
  TOS: ['Firenze', 'Prato', 'Livorno', 'Arezzo', 'Pisa', 'Lucca', 'Pistoia', 'Massa', 'Siena', 'Carrara'],
  CAL: ['Reggio Calabria', 'Catanzaro', 'Cosenza', 'Lamezia Terme', 'Crotone', 'Rende', 'Vibo Valentia', 'Castrovillari', 'Corigliano-Rossano', 'Montalto Uffugo'],
};

// Reino Unido - Nacoes e Regioes
export const UK_REGIONS = [
  { code: 'ENG', name: 'England' },
  { code: 'SCO', name: 'Scotland' },
  { code: 'WAL', name: 'Wales' },
  { code: 'NIR', name: 'Northern Ireland' },
] as const;

export const UK_CITIES: Record<string, string[]> = {
  ENG: ['London', 'Birmingham', 'Manchester', 'Leeds', 'Liverpool', 'Sheffield', 'Bristol', 'Newcastle upon Tyne', 'Nottingham', 'Leicester', 'Southampton', 'Brighton', 'Plymouth', 'Reading', 'Coventry'],
  SCO: ['Glasgow', 'Edinburgh', 'Aberdeen', 'Dundee', 'Paisley', 'East Kilbride', 'Livingston', 'Hamilton', 'Cumbernauld', 'Kirkcaldy'],
  WAL: ['Cardiff', 'Swansea', 'Newport', 'Wrexham', 'Barry', 'Neath', 'Cwmbran', 'Port Talbot', 'Bridgend', 'Llanelli'],
  NIR: ['Belfast', 'Derry', 'Lisburn', 'Newtownabbey', 'Bangor', 'Craigavon', 'Castlereagh', 'Ballymena', 'Newtownards', 'Newry'],
};

// Paises menores - Cidades principais
export const NETHERLANDS_CITIES = ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Tilburg', 'Groningen', 'Almere', 'Breda', 'Nijmegen'];
export const BELGIUM_CITIES = ['Brussels', 'Antwerp', 'Ghent', 'Charleroi', 'Liege', 'Bruges', 'Namur', 'Leuven', 'Mons', 'Aalst'];
export const SWITZERLAND_CITIES = ['Zurich', 'Geneva', 'Basel', 'Lausanne', 'Bern', 'Winterthur', 'Lucerne', 'St. Gallen', 'Lugano', 'Biel/Bienne'];
export const AUSTRIA_CITIES = ['Vienna', 'Graz', 'Linz', 'Salzburg', 'Innsbruck', 'Klagenfurt', 'Villach', 'Wels', 'Sankt Polten', 'Dornbirn'];
export const IRELAND_CITIES = ['Dublin', 'Cork', 'Limerick', 'Galway', 'Waterford', 'Drogheda', 'Dundalk', 'Swords', 'Bray', 'Navan'];

// Helper function para obter cidades baseado no pais e regiao
export function getEuropeCities(countryCode: string, regionCode?: string): string[] {
  switch (countryCode) {
    case 'ES':
      return regionCode ? SPAIN_CITIES[regionCode] || [] : Object.values(SPAIN_CITIES).flat();
    case 'FR':
      return regionCode ? FRANCE_CITIES[regionCode] || [] : Object.values(FRANCE_CITIES).flat();
    case 'DE':
      return regionCode ? GERMANY_CITIES[regionCode] || [] : Object.values(GERMANY_CITIES).flat();
    case 'IT':
      return regionCode ? ITALY_CITIES[regionCode] || [] : Object.values(ITALY_CITIES).flat();
    case 'GB':
      return regionCode ? UK_CITIES[regionCode] || [] : Object.values(UK_CITIES).flat();
    case 'NL':
      return NETHERLANDS_CITIES;
    case 'BE':
      return BELGIUM_CITIES;
    case 'CH':
      return SWITZERLAND_CITIES;
    case 'AT':
      return AUSTRIA_CITIES;
    case 'IE':
      return IRELAND_CITIES;
    default:
      return [];
  }
}

// Helper function para obter regioes de um pais
export function getEuropeRegions(countryCode: string) {
  switch (countryCode) {
    case 'ES':
      return SPAIN_REGIONS;
    case 'FR':
      return FRANCE_REGIONS;
    case 'DE':
      return GERMANY_STATES;
    case 'IT':
      return ITALY_REGIONS;
    case 'GB':
      return UK_REGIONS;
    default:
      return [];
  }
}
