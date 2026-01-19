// Lista de cidades da America do Sul por pais/estado para dropdown
// Principais paises sul-americanos (exceto Brasil que tem arquivo separado)

export const SOUTH_AMERICA_COUNTRIES = [
  { code: 'AR', name: 'Argentina' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'PE', name: 'Peru' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'EC', name: 'Equador' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'PY', name: 'Paraguai' },
  { code: 'UY', name: 'Uruguai' },
] as const;

export type SouthAmericaCountryCode = (typeof SOUTH_AMERICA_COUNTRIES)[number]['code'];

// Argentina - Provincias
export const ARGENTINA_PROVINCES = [
  { code: 'BA', name: 'Buenos Aires' },
  { code: 'CA', name: 'Catamarca' },
  { code: 'CH', name: 'Chaco' },
  { code: 'CT', name: 'Chubut' },
  { code: 'CB', name: 'Cordoba' },
  { code: 'CR', name: 'Corrientes' },
  { code: 'ER', name: 'Entre Rios' },
  { code: 'FO', name: 'Formosa' },
  { code: 'JY', name: 'Jujuy' },
  { code: 'LP', name: 'La Pampa' },
  { code: 'LR', name: 'La Rioja' },
  { code: 'MZ', name: 'Mendoza' },
  { code: 'MI', name: 'Misiones' },
  { code: 'NQ', name: 'Neuquen' },
  { code: 'RN', name: 'Rio Negro' },
  { code: 'SA', name: 'Salta' },
  { code: 'SJ', name: 'San Juan' },
  { code: 'SL', name: 'San Luis' },
  { code: 'SC', name: 'Santa Cruz' },
  { code: 'SF', name: 'Santa Fe' },
  { code: 'SE', name: 'Santiago del Estero' },
  { code: 'TF', name: 'Tierra del Fuego' },
  { code: 'TU', name: 'Tucuman' },
  { code: 'CABA', name: 'Ciudad Autonoma de Buenos Aires' },
] as const;

export const ARGENTINA_CITIES: Record<string, string[]> = {
  BA: ['La Plata', 'Mar del Plata', 'Bahia Blanca', 'Tandil', 'San Nicolas de los Arroyos', 'Pergamino', 'Olavarria', 'Necochea', 'Junin', 'Zarate'],
  CA: ['San Fernando del Valle de Catamarca', 'Tinogasta', 'Andalgala', 'Belen', 'Santa Maria', 'Recreo', 'Fray Mamerto Esquiu', 'Chumbicha', 'Fiambala', 'Pomán'],
  CH: ['Resistencia', 'Presidencia Roque Saenz Pena', 'Villa Angela', 'General San Martin', 'Charata', 'Barranqueras', 'Las Brenas', 'Quitilipi', 'Machagai', 'Juan Jose Castelli'],
  CT: ['Rawson', 'Comodoro Rivadavia', 'Trelew', 'Puerto Madryn', 'Esquel', 'Sarmiento', 'Rada Tilly', 'Gaiman', 'Lago Puelo', 'El Hoyo'],
  CB: ['Cordoba', 'Villa Maria', 'Rio Cuarto', 'San Francisco', 'Villa Carlos Paz', 'Alta Gracia', 'Rio Tercero', 'Bell Ville', 'La Calera', 'Jesus Maria'],
  CR: ['Corrientes', 'Goya', 'Paso de los Libres', 'Mercedes', 'Curuzu Cuatia', 'Bella Vista', 'Santo Tomé', 'Esquina', 'Empedrado', 'Ituzaingo'],
  ER: ['Parana', 'Concordia', 'Gualeguaychu', 'Concepcion del Uruguay', 'Villaguay', 'Gualeguay', 'Colon', 'Victoria', 'Federacion', 'Diamante'],
  FO: ['Formosa', 'Clorinda', 'Pirane', 'El Colorado', 'Laguna Blanca', 'Ingeniero Juarez', 'Ibarreta', 'Las Lomitas', 'Comandante Fontana', 'Estanislao del Campo'],
  JY: ['San Salvador de Jujuy', 'San Pedro de Jujuy', 'Libertador General San Martin', 'Palpala', 'El Carmen', 'Humahuaca', 'La Quiaca', 'Tilcara', 'Abra Pampa', 'Monterrico'],
  LP: ['Santa Rosa', 'General Pico', 'General Acha', 'Toay', 'Eduardo Castex', 'Realico', 'Victorica', 'Ingeniero Luiggi', 'Macachín', 'Guatrache'],
  LR: ['La Rioja', 'Chilecito', 'Chamical', 'Aimogasta', 'Chepes', 'Villa Union', 'Anillaco', 'Famatina', 'Sanagasta', 'Ulapes'],
  MZ: ['Mendoza', 'San Rafael', 'Godoy Cruz', 'Las Heras', 'Guaymallen', 'Maipu', 'Lujan de Cuyo', 'Tunuyan', 'Rivadavia', 'San Martin'],
  MI: ['Posadas', 'Obera', 'Eldorado', 'Puerto Iguazu', 'Apostoles', 'Jardin America', 'Garupa', 'Montecarlo', 'San Vicente', 'Leandro N. Alem'],
  NQ: ['Neuquen', 'San Martin de los Andes', 'Zapala', 'Cutral Co', 'Plaza Huincul', 'Centenario', 'Junin de los Andes', 'Villa La Angostura', 'Plottier', 'Senillosa'],
  RN: ['Viedma', 'San Carlos de Bariloche', 'General Roca', 'Cipolletti', 'El Bolson', 'Allen', 'Cinco Saltos', 'Villa Regina', 'Choele Choel', 'Ingeniero Jacobacci'],
  SA: ['Salta', 'San Ramon de la Nueva Oran', 'Tartagal', 'General Guemes', 'Metan', 'Joaquin V. Gonzalez', 'Embarcacion', 'Cafayate', 'Rosario de la Frontera', 'Aguaray'],
  SJ: ['San Juan', 'Rawson', 'Chimbas', 'Rivadavia', 'Santa Lucia', 'Pocito', 'Caucete', 'Albardón', 'Jáchal', 'San Martin'],
  SL: ['San Luis', 'Villa Mercedes', 'Merlo', 'La Punta', 'Justo Daract', 'Santa Rosa del Conlara', 'Tilisarao', 'Concarán', 'Quines', 'Naschel'],
  SC: ['Rio Gallegos', 'Caleta Olivia', 'Puerto Deseado', 'Pico Truncado', 'Las Heras', 'El Calafate', 'San Julian', 'Puerto Santa Cruz', 'Perito Moreno', 'El Chalten'],
  SF: ['Santa Fe', 'Rosario', 'Rafaela', 'Reconquista', 'Venado Tuerto', 'Villa Gobernador Galvez', 'San Lorenzo', 'Esperanza', 'Casilda', 'Granadero Baigorria'],
  SE: ['Santiago del Estero', 'La Banda', 'Termas de Rio Hondo', 'Anatuya', 'Frias', 'Anatuya', 'Quimili', 'Loreto', 'Fernandez', 'Suncho Corral'],
  TF: ['Ushuaia', 'Rio Grande', 'Tolhuin'],
  TU: ['San Miguel de Tucuman', 'Yerba Buena', 'Tafi Viejo', 'Banda del Rio Sali', 'Concepcion', 'Alderetes', 'Monteros', 'Aguilares', 'Famailla', 'Simoca'],
  CABA: ['Buenos Aires'],
};

// Chile - Regiones
export const CHILE_REGIONS = [
  { code: 'AP', name: 'Arica y Parinacota' },
  { code: 'TA', name: 'Tarapaca' },
  { code: 'AN', name: 'Antofagasta' },
  { code: 'AT', name: 'Atacama' },
  { code: 'CO', name: 'Coquimbo' },
  { code: 'VA', name: 'Valparaiso' },
  { code: 'RM', name: 'Region Metropolitana' },
  { code: 'OH', name: 'O Higgins' },
  { code: 'ML', name: 'Maule' },
  { code: 'NB', name: 'Nuble' },
  { code: 'BI', name: 'Biobio' },
  { code: 'AR', name: 'La Araucania' },
  { code: 'LR', name: 'Los Rios' },
  { code: 'LL', name: 'Los Lagos' },
  { code: 'AI', name: 'Aysen' },
  { code: 'MA', name: 'Magallanes' },
] as const;

export const CHILE_CITIES: Record<string, string[]> = {
  AP: ['Arica', 'Putre', 'Camarones', 'General Lagos'],
  TA: ['Iquique', 'Alto Hospicio', 'Pozo Almonte', 'Pica', 'Huara', 'Colchane', 'Camiña'],
  AN: ['Antofagasta', 'Calama', 'Tocopilla', 'Mejillones', 'Taltal', 'Maria Elena', 'San Pedro de Atacama'],
  AT: ['Copiapo', 'Vallenar', 'Chañaral', 'Diego de Almagro', 'Caldera', 'Tierra Amarilla', 'Huasco'],
  CO: ['La Serena', 'Coquimbo', 'Ovalle', 'Illapel', 'Salamanca', 'Vicuna', 'Los Vilos'],
  VA: ['Valparaiso', 'Vina del Mar', 'Quilpue', 'Villa Alemana', 'San Antonio', 'Quillota', 'Los Andes', 'San Felipe', 'Limache', 'La Calera'],
  RM: ['Santiago', 'Puente Alto', 'Maipu', 'La Florida', 'Las Condes', 'Peñalolen', 'San Bernardo', 'Providencia', 'Ñuñoa', 'Vitacura', 'Lo Barnechea', 'Colina', 'Lampa'],
  OH: ['Rancagua', 'San Fernando', 'Machali', 'Rengo', 'Graneros', 'San Vicente de Tagua Tagua', 'Santa Cruz', 'Chimbarongo'],
  ML: ['Talca', 'Curico', 'Linares', 'Constitución', 'Cauquenes', 'Molina', 'Parral', 'San Javier'],
  NB: ['Chillan', 'Chillan Viejo', 'San Carlos', 'Bulnes', 'Coihueco', 'Quillon', 'Yungay'],
  BI: ['Concepcion', 'Talcahuano', 'Los Angeles', 'Chillan', 'Coronel', 'Hualpen', 'San Pedro de la Paz', 'Chiguayante', 'Tome', 'Lota'],
  AR: ['Temuco', 'Padre las Casas', 'Villarrica', 'Angol', 'Pucon', 'Victoria', 'Lautaro', 'Nueva Imperial', 'Pitrufquen'],
  LR: ['Valdivia', 'La Union', 'Rio Bueno', 'Panguipulli', 'Los Lagos', 'Mariquina', 'Futrono'],
  LL: ['Puerto Montt', 'Osorno', 'Castro', 'Puerto Varas', 'Ancud', 'Calbuco', 'Quellon', 'Frutillar', 'Llanquihue'],
  AI: ['Coyhaique', 'Puerto Aysen', 'Chile Chico', 'Cochrane', 'Puerto Cisnes', 'La Junta'],
  MA: ['Punta Arenas', 'Puerto Natales', 'Porvenir', 'Puerto Williams'],
};

// Colombia - Departamentos
export const COLOMBIA_DEPARTMENTS = [
  { code: 'ANT', name: 'Antioquia' },
  { code: 'ATL', name: 'Atlantico' },
  { code: 'BOL', name: 'Bolivar' },
  { code: 'BOY', name: 'Boyaca' },
  { code: 'CAL', name: 'Caldas' },
  { code: 'CAU', name: 'Cauca' },
  { code: 'CUN', name: 'Cundinamarca' },
  { code: 'HUI', name: 'Huila' },
  { code: 'MAG', name: 'Magdalena' },
  { code: 'NAR', name: 'Narino' },
  { code: 'NSA', name: 'Norte de Santander' },
  { code: 'QUI', name: 'Quindio' },
  { code: 'RIS', name: 'Risaralda' },
  { code: 'SAN', name: 'Santander' },
  { code: 'TOL', name: 'Tolima' },
  { code: 'VAL', name: 'Valle del Cauca' },
  { code: 'DC', name: 'Bogota D.C.' },
] as const;

export const COLOMBIA_CITIES: Record<string, string[]> = {
  ANT: ['Medellin', 'Bello', 'Itagui', 'Envigado', 'Apartado', 'Rionegro', 'Turbo', 'Caucasia', 'Sabaneta', 'La Estrella'],
  ATL: ['Barranquilla', 'Soledad', 'Malambo', 'Sabanalarga', 'Galapa', 'Puerto Colombia', 'Baranoa', 'Campo de la Cruz'],
  BOL: ['Cartagena', 'Magangue', 'Turbaco', 'Arjona', 'El Carmen de Bolivar', 'Maria la Baja', 'San Juan Nepomuceno', 'Mompos'],
  BOY: ['Tunja', 'Duitama', 'Sogamoso', 'Chiquinquira', 'Paipa', 'Puerto Boyaca', 'Villa de Leyva', 'Nobsa'],
  CAL: ['Manizales', 'La Dorada', 'Chinchina', 'Villamaria', 'Riosucio', 'Anserma', 'Aguadas', 'Pensilvania'],
  CAU: ['Popayan', 'Santander de Quilichao', 'Puerto Tejada', 'El Bordo', 'Piendamo', 'Timbio', 'Silvia', 'Corinto'],
  CUN: ['Soacha', 'Facatativa', 'Zipaquira', 'Chia', 'Fusagasuga', 'Girardot', 'Mosquera', 'Madrid', 'Cajica', 'Funza'],
  HUI: ['Neiva', 'Pitalito', 'Garzon', 'La Plata', 'Campoalegre', 'San Agustin', 'Gigante', 'Rivera'],
  MAG: ['Santa Marta', 'Cienaga', 'Fundacion', 'El Banco', 'Aracataca', 'Plato', 'Zona Bananera', 'Puebloviejo'],
  NAR: ['Pasto', 'Ipiales', 'Tumaco', 'Tuquerres', 'La Union', 'Samaniego', 'Sandona', 'Guachucal'],
  NSA: ['Cucuta', 'Ocana', 'Pamplona', 'Los Patios', 'Villa del Rosario', 'El Zulia', 'Tibu', 'Chinacota'],
  QUI: ['Armenia', 'Calarca', 'Montenegro', 'Quimbaya', 'La Tebaida', 'Circasia', 'Filandia', 'Salento'],
  RIS: ['Pereira', 'Dosquebradas', 'Santa Rosa de Cabal', 'La Virginia', 'Marsella', 'Belen de Umbria', 'Apia', 'Quinchia'],
  SAN: ['Bucaramanga', 'Floridablanca', 'Giron', 'Piedecuesta', 'Barrancabermeja', 'San Gil', 'Socorro', 'Velez'],
  TOL: ['Ibague', 'Espinal', 'Melgar', 'Honda', 'Mariquita', 'Chaparral', 'Libano', 'Flandes'],
  VAL: ['Cali', 'Buenaventura', 'Palmira', 'Tulua', 'Buga', 'Cartago', 'Yumbo', 'Jamundi', 'Florida', 'Candelaria'],
  DC: ['Bogota'],
};

// Peru - Departamentos
export const PERU_DEPARTMENTS = [
  { code: 'AMA', name: 'Amazonas' },
  { code: 'ANC', name: 'Ancash' },
  { code: 'APU', name: 'Apurimac' },
  { code: 'ARE', name: 'Arequipa' },
  { code: 'AYA', name: 'Ayacucho' },
  { code: 'CAJ', name: 'Cajamarca' },
  { code: 'CUS', name: 'Cusco' },
  { code: 'HUV', name: 'Huancavelica' },
  { code: 'HUC', name: 'Huanuco' },
  { code: 'ICA', name: 'Ica' },
  { code: 'JUN', name: 'Junin' },
  { code: 'LAL', name: 'La Libertad' },
  { code: 'LAM', name: 'Lambayeque' },
  { code: 'LIM', name: 'Lima' },
  { code: 'LOR', name: 'Loreto' },
  { code: 'MDD', name: 'Madre de Dios' },
  { code: 'MOQ', name: 'Moquegua' },
  { code: 'PAS', name: 'Pasco' },
  { code: 'PIU', name: 'Piura' },
  { code: 'PUN', name: 'Puno' },
  { code: 'SAM', name: 'San Martin' },
  { code: 'TAC', name: 'Tacna' },
  { code: 'TUM', name: 'Tumbes' },
  { code: 'UCA', name: 'Ucayali' },
] as const;

export const PERU_CITIES: Record<string, string[]> = {
  AMA: ['Chachapoyas', 'Bagua', 'Bagua Grande', 'Luya', 'Utcubamba'],
  ANC: ['Huaraz', 'Chimbote', 'Nuevo Chimbote', 'Casma', 'Huarmey', 'Caraz'],
  APU: ['Abancay', 'Andahuaylas', 'Chincheros', 'Chalhuanca'],
  ARE: ['Arequipa', 'Camana', 'Mollendo', 'Mejia', 'Islay', 'Caylloma'],
  AYA: ['Ayacucho', 'Huanta', 'San Juan Bautista', 'Puquio', 'Coracora'],
  CAJ: ['Cajamarca', 'Jaen', 'Chota', 'Cutervo', 'Celendin', 'Bambamarca'],
  CUS: ['Cusco', 'Santiago', 'Wanchaq', 'San Sebastian', 'Sicuani', 'Urubamba', 'Ollantaytambo'],
  HUV: ['Huancavelica', 'Pampas', 'Lircay', 'Acobamba', 'Castrovirreyna'],
  HUC: ['Huanuco', 'Tingo Maria', 'Ambo', 'La Union', 'Llata'],
  ICA: ['Ica', 'Chincha Alta', 'Pisco', 'Nazca', 'Palpa'],
  JUN: ['Huancayo', 'Tarma', 'Chanchamayo', 'La Oroya', 'Jauja', 'Satipo'],
  LAL: ['Trujillo', 'Chepen', 'Pacasmayo', 'Otuzco', 'Viru', 'Laredo'],
  LAM: ['Chiclayo', 'Lambayeque', 'Ferrenafe', 'Monsefu', 'Pimentel'],
  LIM: ['Lima', 'San Juan de Lurigancho', 'San Martin de Porres', 'Ate', 'Callao', 'Comas', 'Villa El Salvador', 'San Juan de Miraflores', 'Los Olivos', 'Miraflores'],
  LOR: ['Iquitos', 'Yurimaguas', 'Requena', 'Contamana', 'Nauta'],
  MDD: ['Puerto Maldonado', 'Tambopata', 'Manu', 'Tahuamanu'],
  MOQ: ['Moquegua', 'Ilo', 'Mariscal Nieto', 'Sanchez Cerro'],
  PAS: ['Cerro de Pasco', 'Yanahuanca', 'Oxapampa', 'Villa Rica'],
  PIU: ['Piura', 'Sullana', 'Talara', 'Paita', 'Sechura', 'Catacaos'],
  PUN: ['Puno', 'Juliaca', 'Ayaviri', 'Ilave', 'Azangaro', 'Macusani'],
  SAM: ['Moyobamba', 'Tarapoto', 'Rioja', 'Juanjui', 'Tocache'],
  TAC: ['Tacna', 'Alto de la Alianza', 'Ciudad Nueva', 'Pocollay'],
  TUM: ['Tumbes', 'Zarumilla', 'Aguas Verdes', 'Corrales'],
  UCA: ['Pucallpa', 'Aguaytia', 'Padre Abad', 'Coronel Portillo'],
};

// Venezuela - Estados
export const VENEZUELA_STATES = [
  { code: 'AMA', name: 'Amazonas' },
  { code: 'ANZ', name: 'Anzoategui' },
  { code: 'APU', name: 'Apure' },
  { code: 'ARA', name: 'Aragua' },
  { code: 'BAR', name: 'Barinas' },
  { code: 'BOL', name: 'Bolivar' },
  { code: 'CAR', name: 'Carabobo' },
  { code: 'COJ', name: 'Cojedes' },
  { code: 'DAM', name: 'Delta Amacuro' },
  { code: 'DC', name: 'Distrito Capital' },
  { code: 'FAL', name: 'Falcon' },
  { code: 'GUA', name: 'Guarico' },
  { code: 'LAR', name: 'Lara' },
  { code: 'MER', name: 'Merida' },
  { code: 'MIR', name: 'Miranda' },
  { code: 'MON', name: 'Monagas' },
  { code: 'NES', name: 'Nueva Esparta' },
  { code: 'POR', name: 'Portuguesa' },
  { code: 'SUC', name: 'Sucre' },
  { code: 'TAC', name: 'Tachira' },
  { code: 'TRU', name: 'Trujillo' },
  { code: 'VAR', name: 'Vargas' },
  { code: 'YAR', name: 'Yaracuy' },
  { code: 'ZUL', name: 'Zulia' },
] as const;

export const VENEZUELA_CITIES: Record<string, string[]> = {
  AMA: ['Puerto Ayacucho', 'San Fernando de Atabapo', 'Maroa', 'La Esmeralda'],
  ANZ: ['Barcelona', 'Puerto La Cruz', 'Lecheria', 'El Tigre', 'Anaco', 'Puerto Piritu'],
  APU: ['San Fernando de Apure', 'Guasdualito', 'Achaguas', 'Biruaca', 'Elorza'],
  ARA: ['Maracay', 'Turmero', 'La Victoria', 'Cagua', 'Villa de Cura', 'San Mateo'],
  BAR: ['Barinas', 'Barinitas', 'Socopo', 'Santa Barbara de Barinas', 'Ciudad Bolivia'],
  BOL: ['Ciudad Bolivar', 'Ciudad Guayana', 'Upata', 'Caicara del Orinoco', 'Santa Elena de Uairen'],
  CAR: ['Valencia', 'Puerto Cabello', 'Guacara', 'San Diego', 'Naguanagua', 'Los Guayos'],
  COJ: ['San Carlos', 'Tinaco', 'El Baul', 'Tinaquillo', 'Las Vegas'],
  DAM: ['Tucupita', 'Curiapo', 'Pedernales'],
  DC: ['Caracas'],
  FAL: ['Coro', 'Punto Fijo', 'Tucacas', 'Chichiriviche', 'Santa Ana de Coro'],
  GUA: ['San Juan de los Morros', 'Calabozo', 'Valle de la Pascua', 'Altagracia de Orituco', 'Zaraza'],
  LAR: ['Barquisimeto', 'Carora', 'Cabudare', 'Quibor', 'El Tocuyo'],
  MER: ['Merida', 'El Vigia', 'Ejido', 'Tovar', 'Mucuchies', 'Lagunillas'],
  MIR: ['Los Teques', 'Guarenas', 'Guatire', 'Ocumare del Tuy', 'Charallave', 'Cua'],
  MON: ['Maturin', 'Caripito', 'Temblador', 'Punta de Mata', 'Quiriquire'],
  NES: ['Porlamar', 'La Asuncion', 'Juan Griego', 'Pampatar', 'El Valle del Espiritu Santo'],
  POR: ['Guanare', 'Acarigua', 'Araure', 'Biscucuy', 'Ospino'],
  SUC: ['Cumana', 'Carupano', 'Guiria', 'Irapa', 'Cariaco'],
  TAC: ['San Cristobal', 'Tariba', 'Rubio', 'La Grita', 'San Antonio del Tachira', 'Capacho'],
  TRU: ['Trujillo', 'Valera', 'Bocono', 'Escuque', 'Sabana de Mendoza'],
  VAR: ['La Guaira', 'Maiquetia', 'Catia La Mar', 'Macuto', 'Caraballeda'],
  YAR: ['San Felipe', 'Yaritagua', 'Chivacoa', 'Nirgua', 'Cocorote'],
  ZUL: ['Maracaibo', 'Cabimas', 'Ciudad Ojeda', 'Santa Barbara del Zulia', 'Machiques', 'Los Puertos de Altagracia'],
};

// Equador - Provincias
export const ECUADOR_PROVINCES = [
  { code: 'AZU', name: 'Azuay' },
  { code: 'BOL', name: 'Bolivar' },
  { code: 'CAN', name: 'Cañar' },
  { code: 'CAR', name: 'Carchi' },
  { code: 'CHI', name: 'Chimborazo' },
  { code: 'COT', name: 'Cotopaxi' },
  { code: 'EOR', name: 'El Oro' },
  { code: 'ESM', name: 'Esmeraldas' },
  { code: 'GAL', name: 'Galapagos' },
  { code: 'GUA', name: 'Guayas' },
  { code: 'IMB', name: 'Imbabura' },
  { code: 'LOJ', name: 'Loja' },
  { code: 'LOR', name: 'Los Rios' },
  { code: 'MAN', name: 'Manabi' },
  { code: 'MOR', name: 'Morona Santiago' },
  { code: 'NAP', name: 'Napo' },
  { code: 'ORE', name: 'Orellana' },
  { code: 'PAS', name: 'Pastaza' },
  { code: 'PIC', name: 'Pichincha' },
  { code: 'SDE', name: 'Santa Elena' },
  { code: 'SDO', name: 'Santo Domingo de los Tsachilas' },
  { code: 'SUC', name: 'Sucumbios' },
  { code: 'TUN', name: 'Tungurahua' },
  { code: 'ZAM', name: 'Zamora Chinchipe' },
] as const;

export const ECUADOR_CITIES: Record<string, string[]> = {
  AZU: ['Cuenca', 'Gualaceo', 'Paute', 'Sigsig', 'Giron', 'Santa Isabel'],
  BOL: ['Guaranda', 'San Miguel', 'Chimbo', 'Chillanes', 'Caluma', 'Echeandía'],
  CAN: ['Azogues', 'Cañar', 'La Troncal', 'Biblián', 'El Tambo'],
  CAR: ['Tulcan', 'San Gabriel', 'Mira', 'Bolivar', 'El Angel', 'Huaca'],
  CHI: ['Riobamba', 'Alausí', 'Guano', 'Colta', 'Chunchi', 'Chambo'],
  COT: ['Latacunga', 'La Maná', 'Salcedo', 'Saquisilí', 'Pujilí', 'Pangua'],
  EOR: ['Machala', 'Santa Rosa', 'Pasaje', 'Huaquillas', 'El Guabo', 'Arenillas'],
  ESM: ['Esmeraldas', 'Quinindé', 'San Lorenzo', 'Atacames', 'Muisne', 'Eloy Alfaro'],
  GAL: ['Puerto Baquerizo Moreno', 'Puerto Ayora', 'Puerto Villamil'],
  GUA: ['Guayaquil', 'Durán', 'Milagro', 'Daule', 'Samborondón', 'Naranjal', 'El Empalme', 'Balzar'],
  IMB: ['Ibarra', 'Otavalo', 'Cotacachi', 'Antonio Ante', 'Pimampiro', 'Urcuquí'],
  LOJ: ['Loja', 'Catamayo', 'Macará', 'Cariamanga', 'Saraguro', 'Celica'],
  LOR: ['Babahoyo', 'Quevedo', 'Vinces', 'Ventanas', 'Buena Fe', 'Valencia'],
  MAN: ['Portoviejo', 'Manta', 'Chone', 'El Carmen', 'Jipijapa', 'Montecristi', 'Bahía de Caráquez'],
  MOR: ['Macas', 'Gualaquiza', 'Sucúa', 'Morona', 'Santiago de Méndez'],
  NAP: ['Tena', 'Archidona', 'El Chaco', 'Quijos', 'Carlos Julio Arosemena Tola'],
  ORE: ['Puerto Francisco de Orellana', 'La Joya de los Sachas', 'Loreto'],
  PAS: ['Puyo', 'Mera', 'Santa Clara', 'Arajuno'],
  PIC: ['Quito', 'Sangolquí', 'Machachi', 'Cayambe', 'Tabacundo', 'Conocoto'],
  SDE: ['Santa Elena', 'La Libertad', 'Salinas'],
  SDO: ['Santo Domingo', 'La Concordia', 'Valle Hermoso', 'Luz de América'],
  SUC: ['Nueva Loja', 'Shushufindi', 'Lago Agrio', 'Cuyabeno', 'Gonzalo Pizarro'],
  TUN: ['Ambato', 'Baños de Agua Santa', 'Pelileo', 'Pillaro', 'Patate', 'Cevallos'],
  ZAM: ['Zamora', 'Yantzaza', 'Zumba', 'El Pangui', 'Centinela del Cóndor'],
};

// Paises menores - Cidades principais
export const BOLIVIA_CITIES: Record<string, string[]> = {
  LP: ['La Paz', 'El Alto', 'Viacha', 'Achacachi', 'Copacabana'],
  CB: ['Cochabamba', 'Quillacollo', 'Sacaba', 'Tiquipaya', 'Colcapirhua'],
  SC: ['Santa Cruz de la Sierra', 'Montero', 'Warnes', 'La Guardia', 'Cotoca'],
  OR: ['Oruro', 'Huanuni', 'Machacamarca', 'Challapata'],
  PT: ['Potosi', 'Llallagua', 'Uyuni', 'Villazón', 'Tupiza'],
  TJ: ['Tarija', 'Yacuiba', 'Bermejo', 'Villa Montes', 'San Lorenzo'],
  CH: ['Sucre', 'Camargo', 'Monteagudo', 'Villa Serrano'],
  BN: ['Trinidad', 'Riberalta', 'Guayaramerin', 'San Borja', 'Rurrenabaque'],
  PD: ['Cobija', 'Porvenir', 'Bella Flor', 'Bolpebra'],
};

export const BOLIVIA_DEPARTMENTS = [
  { code: 'LP', name: 'La Paz' },
  { code: 'CB', name: 'Cochabamba' },
  { code: 'SC', name: 'Santa Cruz' },
  { code: 'OR', name: 'Oruro' },
  { code: 'PT', name: 'Potosi' },
  { code: 'TJ', name: 'Tarija' },
  { code: 'CH', name: 'Chuquisaca' },
  { code: 'BN', name: 'Beni' },
  { code: 'PD', name: 'Pando' },
] as const;

export const PARAGUAY_CITIES = ['Asuncion', 'Ciudad del Este', 'San Lorenzo', 'Luque', 'Capiata', 'Lambare', 'Fernando de la Mora', 'Limpio', 'Nemby', 'Encarnacion', 'Pedro Juan Caballero', 'Mariano Roque Alonso'];

export const URUGUAY_CITIES = ['Montevideo', 'Salto', 'Paysandu', 'Las Piedras', 'Rivera', 'Maldonado', 'Tacuarembo', 'Melo', 'Mercedes', 'Artigas', 'Minas', 'San Jose de Mayo', 'Durazno', 'Florida', 'Treinta y Tres'];

// Helper function para obter cidades baseado no pais e regiao
export function getSouthAmericaCities(countryCode: string, regionCode?: string): string[] {
  switch (countryCode) {
    case 'AR':
      return regionCode ? ARGENTINA_CITIES[regionCode] || [] : Object.values(ARGENTINA_CITIES).flat();
    case 'CL':
      return regionCode ? CHILE_CITIES[regionCode] || [] : Object.values(CHILE_CITIES).flat();
    case 'CO':
      return regionCode ? COLOMBIA_CITIES[regionCode] || [] : Object.values(COLOMBIA_CITIES).flat();
    case 'PE':
      return regionCode ? PERU_CITIES[regionCode] || [] : Object.values(PERU_CITIES).flat();
    case 'VE':
      return regionCode ? VENEZUELA_CITIES[regionCode] || [] : Object.values(VENEZUELA_CITIES).flat();
    case 'EC':
      return regionCode ? ECUADOR_CITIES[regionCode] || [] : Object.values(ECUADOR_CITIES).flat();
    case 'BO':
      return regionCode ? BOLIVIA_CITIES[regionCode] || [] : Object.values(BOLIVIA_CITIES).flat();
    case 'PY':
      return PARAGUAY_CITIES;
    case 'UY':
      return URUGUAY_CITIES;
    default:
      return [];
  }
}

// Helper function para obter regioes de um pais
export function getSouthAmericaRegions(countryCode: string) {
  switch (countryCode) {
    case 'AR':
      return ARGENTINA_PROVINCES;
    case 'CL':
      return CHILE_REGIONS;
    case 'CO':
      return COLOMBIA_DEPARTMENTS;
    case 'PE':
      return PERU_DEPARTMENTS;
    case 'VE':
      return VENEZUELA_STATES;
    case 'EC':
      return ECUADOR_PROVINCES;
    case 'BO':
      return BOLIVIA_DEPARTMENTS;
    default:
      return [];
  }
}
