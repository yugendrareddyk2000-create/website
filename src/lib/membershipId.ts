// SSPPAAMMVVVGNNNNN  (17 chars)
export function formatMembershipId(parts: {
  state: string; pc: string; ac: string; mandal: string;
  village: string; gender: "M"|"F"|"O"; serial: number;
}) {
  return `${parts.state.padStart(2,"0")}${parts.pc.padStart(2,"0")}${parts.ac.padStart(2,"0")}${parts.mandal.padStart(2,"0")}${parts.village.padStart(3,"0")}${parts.gender}${String(parts.serial).padStart(5,"0")}`;
}
