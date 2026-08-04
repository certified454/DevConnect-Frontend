declare module 'naija-state-local-government' {
  const NaijaStates: {
    all: () => Array<{ state: string; lgas: string[]; senatorial_district?: string[] }>;
    states: () => string[];
    lgas: (state: string) => { state: string; lgas: string[] };
    senatorialDistricts: (state: string) => { state: string; senatorial_district: string[] };
  };
  export default NaijaStates;
}