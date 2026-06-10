"use client";
import { useEffect, useState } from "react";

type Opt = { id: number; name: string };
const fetcher = (u: string) => fetch(u).then(r => r.json());

export type AddressValue = {
  address_line1: string; address_line2: string; pincode: string;
  state_id: number; pc_id: number; ac_id: number; mandal_id: number; village_id: number;
};

export const EMPTY_ADDRESS: AddressValue = {
  address_line1: "", address_line2: "", pincode: "",
  state_id: 0, pc_id: 0, ac_id: 0, mandal_id: 0, village_id: 0,
};

export function AddressFields({
  value, onChange,
}: { value: AddressValue; onChange: (v: AddressValue) => void }) {
  const [states, setStates] = useState<Opt[]>([]);
  const [pcs, setPcs] = useState<Opt[]>([]);
  const [acs, setAcs] = useState<Opt[]>([]);
  const [mds, setMds] = useState<Opt[]>([]);
  const [vls, setVls] = useState<Opt[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => { fetcher("/api/locations/states").then(setStates); }, []);
  useEffect(() => { value.state_id && fetcher(`/api/locations/pcs?state_id=${value.state_id}`).then(setPcs); }, [value.state_id]);
  useEffect(() => { value.pc_id    && fetcher(`/api/locations/acs?pc_id=${value.pc_id}`).then(setAcs); }, [value.pc_id]);
  useEffect(() => { value.ac_id    && fetcher(`/api/locations/mandals?ac_id=${value.ac_id}`).then(setMds); }, [value.ac_id]);
  useEffect(() => {
    if (!value.mandal_id) return;
    const t = setTimeout(() => fetcher(`/api/locations/villages?mandal_id=${value.mandal_id}&q=${encodeURIComponent(q)}`).then(setVls), 200);
    return () => clearTimeout(t);
  }, [value.mandal_id, q]);

  const upd = (patch: Partial<AddressValue>) => onChange({ ...value, ...patch });

  return (
    <>
      <L label="Address line 1"><input className="i" value={value.address_line1} onChange={e=>upd({address_line1:e.target.value})}/></L>
      <L label="Address line 2"><input className="i" value={value.address_line2} onChange={e=>upd({address_line2:e.target.value})}/></L>
      <L label="Pincode"><input className="i" maxLength={6} value={value.pincode} onChange={e=>upd({pincode:e.target.value.replace(/\D/g,"")})}/></L>

      <Sel label="State"      options={states} value={value.state_id}
        onChange={id=>upd({state_id:id, pc_id:0, ac_id:0, mandal_id:0, village_id:0})}/>
      <Sel label="Parliament Constituency" options={pcs} value={value.pc_id}
        disabled={!value.state_id}
        onChange={id=>upd({pc_id:id, ac_id:0, mandal_id:0, village_id:0})}/>
      <Sel label="Assembly Constituency" options={acs} value={value.ac_id}
        disabled={!value.pc_id}
        onChange={id=>upd({ac_id:id, mandal_id:0, village_id:0})}/>
      <Sel label="Mandal" options={mds} value={value.mandal_id}
        disabled={!value.ac_id}
        onChange={id=>upd({mandal_id:id, village_id:0})}/>

      <L label="Village (search)">
        <input className="i mb-2" placeholder="Type to search…"
          value={q} onChange={e=>setQ(e.target.value)} disabled={!value.mandal_id}/>
        <select className="i" value={value.village_id} disabled={!value.mandal_id}
          onChange={e=>upd({village_id: Number(e.target.value)})}>
          <option value={0}>— select —</option>
          {vls.map(v=>(<option key={v.id} value={v.id}>{v.name}</option>))}
        </select>
      </L>

      <style jsx>{`
        :global(.i) { width:100%; border:1px solid #d1d5db; border-radius:0.375rem; padding:0.5rem 0.75rem; }
      `}</style>
    </>
  );
}

function L({ label, children }: any) {
  return <label className="block"><span className="text-sm text-gray-700">{label}</span><div className="mt-1">{children}</div></label>;
}
function Sel({ label, options, value, onChange, disabled }: { label:string; options:Opt[]; value:number; onChange:(n:number)=>void; disabled?:boolean }) {
  return (
    <L label={label}>
      <select className="i" value={value} disabled={disabled} onChange={e=>onChange(Number(e.target.value))}>
        <option value={0}>— select —</option>
        {options.map(o=>(<option key={o.id} value={o.id}>{o.name}</option>))}
      </select>
    </L>
  );
}
