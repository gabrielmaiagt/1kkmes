import React, { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, X, Check, Globe, Clapperboard, ExternalLink } from 'lucide-react';
import * as store from './store';
import { today } from './finance';

// Only allow ordinary web links, including URLs entered without a protocol.
function webUrl(value) {
  const raw = value.trim();
  if (!raw) return '';
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(raw) ? raw : `https://${raw}`);
    return ['http:', 'https:'].includes(url.protocol) && url.hostname.includes('.') && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}
export default function ResourceBoard({ resource }) {
  const domains = resource === 'domains';
  const [items,setItems] = useState([]), [loading,setLoading] = useState(true), [error,setError] = useState('');
  const [search,setSearch] = useState(''), [status,setStatus] = useState('all'), [draft,setDraft] = useState(null), [busy,setBusy] = useState(false);
  useEffect(() => store.subscribe(rows => {setItems(rows);setLoading(false);}, () => {setError('Não foi possível carregar os registros. Confira a conexão e as permissões.');setLoading(false);}, resource), [resource]);
  const filtered = items.filter(i => (!domains || status === 'all' || i.status === status) && `${i.name} ${i.url} ${i.notes}`.toLowerCase().includes(search.toLowerCase())).sort((a,b) => b.date.localeCompare(a.date) || a.name.localeCompare(b.name));
  function open(item) {setError('');setDraft(item || {name:'',url:'',notes:'',date:today(),...(domains ? {status:'active'} : {})});}
  async function submit(e) {
    e.preventDefault();setError('');
    if (!draft.name.trim()) return setError(domains ? 'Informe o domínio.' : 'Informe o nome do criativo.');
    const url = webUrl(domains ? draft.name : draft.url);
    if (url === null || (domains && !url)) return setError('Informe um endereço válido, como exemplo.com. Use links http ou https.');
    setBusy(true);
    try {
      const record = { ...draft, id:draft.id || crypto.randomUUID(), name:domains ? new URL(url).hostname : draft.name.trim(), url, notes:draft.notes.trim(), createdAt:draft.createdAt || new Date().toISOString() };
      const next = await store.save(record,items,resource);if(next)setItems(next);setDraft(null);
    } catch {setError('Não foi possível salvar. Confira sua conexão e permissões.');} finally {setBusy(false);}
  }
  async function remove(item) {
    if (!confirm(`Excluir “${item.name}”?`)) return;
    setBusy(true);setError('');
    try {const next = await store.remove(item.id,items,resource);if(next)setItems(next);} catch {setError('Não foi possível excluir. Tente novamente.');} finally {setBusy(false);}
  }
  const Icon = domains ? Globe : Clapperboard;
  return <>
    <div className="page-title"><div><div className="eyebrow">OPERAÇÃO DA OFERTA</div><h1>{domains ? 'Seus domínios, organizados.' : 'Criativos que deram certo.'}</h1><p>{domains ? 'Acompanhe os domínios ativos e os que foram rejeitados.' : 'Guarde os criativos validados para encontrar e reutilizar.'}</p></div><button className="primary" onClick={() => open()}><Plus size={18}/>{domains ? 'Adicionar domínio' : 'Adicionar criativo'}</button></div>
    {!store.connected && <div className="local-banner">Modo local: registros salvos neste navegador. A sincronização depende da configuração do Firebase.</div>}
    {error && !draft && <div role="alert" className="error">{error}</div>}
    {domains && <div className="section-toolbar"><div className="period-tabs">{[['all','Todos'],['active','Ativos'],['rejected','Rejeitados']].map(([value,label]) => <button key={value} className={status===value?'selected':''} onClick={()=>setStatus(value)}>{label} · {items.filter(i=>value==='all'||i.status===value).length}</button>)}</div></div>}
    <section className="panel transactions"><div className="panel-heading"><div><h2>{domains ? 'Domínios' : 'Criativos validados'} <span className="count">{filtered.length}</span></h2><p>{domains ? 'Altere o status pelo botão de editar.' : 'Nome, link do material e observações em um só lugar.'}</p></div><Icon size={19}/></div><div className="table-filters"><label className="search"><Search size={16}/><input aria-label={domains?'Buscar domínio':'Buscar criativo'} placeholder={domains?'Buscar domínio...':'Buscar criativo...'} value={search} onChange={e=>setSearch(e.target.value)}/></label></div>
    <div className="table-scroll"><table><thead><tr><th>{domains?'DOMÍNIO':'CRIATIVO'}</th>{domains && <th>STATUS</th>}<th>{domains?'DATA DO REGISTRO':'VALIDADO EM'}</th><th>OBSERVAÇÕES</th><th>LINK</th><th aria-label="Ações"/></tr></thead><tbody>{filtered.map(item => <tr key={item.id}><td><div className="entry-name"><span className="entry-icon revenue"><Icon size={17}/></span><strong>{item.name}</strong></div></td>{domains && <td><span className={`badge ${item.status==='rejected'?'badge-rejected':'badge-active'}`}>{item.status==='rejected'?'Rejeitado':'Ativo'}</span></td>}<td>{item.date.split('-').reverse().join('/')}</td><td className="resource-notes">{item.notes || '—'}</td><td>{item.url && webUrl(item.url) ? <a className="resource-link" href={webUrl(item.url)} target="_blank" rel="noopener noreferrer">Abrir <ExternalLink size={12}/></a> : '—'}</td><td><div className="row-actions"><button aria-label={`Editar ${item.name}`} onClick={()=>open(item)} disabled={busy}><Pencil size={14}/></button><button aria-label={`Excluir ${item.name}`} onClick={()=>remove(item)} disabled={busy}><Trash2 size={14}/></button></div></td></tr>)}</tbody></table></div>
    {!filtered.length && <div className="empty"><div className="empty-icon"><Icon size={24}/></div><strong>{loading?'Carregando…':items.length?'Nenhum resultado neste filtro':domains?'Adicione seu primeiro domínio':'Guarde seu primeiro criativo validado'}</strong><p>{domains?'Mantenha o status e as observações sempre à mão.':'Cole o link do vídeo, imagem ou pasta e anote o que funcionou.'}</p>{!loading && !items.length && <button className="text-button" onClick={()=>open()}>Adicionar <Plus size={15}/></button>}</div>}
    <div className="table-footer">{filtered.length} de {items.length} registros</div></section>
    {draft && <div className="overlay" onClick={e=>{if(e.target===e.currentTarget && !busy)setDraft(null);}}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="resource-title"><button className="close" aria-label="Fechar" disabled={busy} onClick={()=>setDraft(null)}><X size={21}/></button><form onSubmit={submit}><div className="eyebrow">OPERAÇÃO DA OFERTA</div><h2 id="resource-title">{draft.id?'Editar':'Adicionar'} {domains?'domínio':'criativo validado'}</h2><label>{domains?'Domínio':'Nome do criativo'}<input autoFocus required maxLength={253} placeholder={domains?'exemplo.com':'Ex.: Vídeo depoimento 01'} value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})}/></label>{!domains && <label>Link do material <span className="optional">(opcional)</span><input maxLength={2000} placeholder="https://..." value={draft.url} onChange={e=>setDraft({...draft,url:e.target.value})}/></label>}{domains && <label>Status<select value={draft.status} onChange={e=>setDraft({...draft,status:e.target.value})}><option value="active">Ativo</option><option value="rejected">Rejeitado</option></select></label>}<label>{domains?'Data do registro':'Data da validação'}<input required type="date" max="9999-12-31" value={draft.date} onChange={e=>setDraft({...draft,date:e.target.value})}/></label><label>Observações <span className="optional">(opcional)</span><textarea rows={3} maxLength={2000} placeholder={domains?'Ex.: Motivo da rejeição, uso do domínio...':'Ex.: Gancho, público, campanha em que funcionou...'} value={draft.notes} onChange={e=>setDraft({...draft,notes:e.target.value})}/></label>{error && <div role="alert" className="error">{error}</div>}<div className="modal-actions"><button type="button" className="secondary" disabled={busy} onClick={()=>setDraft(null)}>Cancelar</button><button className="primary" disabled={busy}>{busy?'Salvando…':'Salvar'}<Check size={16}/></button></div></form></section></div>}
  </>;
}
