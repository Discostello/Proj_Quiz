// ===== Слой данных =====
const sb = () => SB_URL && SB_KEY;
const H = () => ({apikey:SB_KEY, Authorization:'Bearer ' + SB_KEY, 'Content-Type':'application/json'});
const loc = () => { try { return JSON.parse(localStorage.getItem('tq_lb')) || []; } catch (e) { return []; } };
const DB = {
  async save(r) {
    if (sb()) {
      const x = await fetch(SB_URL + '/rest/v1/rpc/submit_score', {method:'POST', headers:H(),
        body:JSON.stringify({p_nickname:r.nickname, p_topic:r.topic, p_score:r.score, p_correct:r.correct_answers, p_time:r.time_seconds})});
      if (!x.ok) throw new Error(x.status);
      return;
    }
    const a = loc(), o = a.find(e => e.nickname === r.nickname && e.topic === r.topic);
    if (!o) a.push(r);
    else if (r.score > o.score || (r.score === o.score && r.time_seconds < o.time_seconds)) Object.assign(o, r);
    try { localStorage.setItem('tq_lb', JSON.stringify(a)); } catch (e) {}
  },
  async all() {
    if (sb()) {
      const x = await fetch(SB_URL + '/rest/v1/leaderboard?select=nickname,topic,score,correct_answers,time_seconds&limit=2000', {headers:H()});
      if (!x.ok) throw new Error(x.status);
      return x.json();
    }
    return loc();
  }
};
