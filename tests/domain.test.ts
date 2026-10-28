import test from 'node:test';
import assert from 'node:assert/strict';
import { addIssue, addVersion, acceptScreen, canSign, currentVersion, createProject, editScreen, escapeHtml, fingerprint, isAccepted, isSigned, pendingFor, readiness, safeUrl, setIssueStatus, signProject } from '../src/domain.ts';
import type { Workspace, Project, Issue } from '../src/domain.ts';
function fixture(): Workspace {
  const p: Project = { ...createProject('Test','Client','website',''), id:'p', screens:[{ id:'s',name:'Home',path:'/',viewport:1440,reference:'data:image/png;base64,abc',referenceId:'ref1',versions:[{id:'v1',name:'v1',image:'data:image/png;base64,abc',width:1440,height:900,createdAt:'2026-01-01T00:00:00Z'}] }] };
  return {schema:1,studio:'Studio',person:'Designer',projects:[p],issues:[],activity:[]};
}
const issue = (): Issue => ({id:'i',projectId:'p',screenId:'s',versionId:'v1',title:'Spacing',description:'Fix spacing',x:10,y:20,status:'open',priority:'high',kind:'fix',assignee:'Developer',createdAt:'2026-01-01T00:00:00Z',comments:[]});
test('new project trims names and starts without screens',() => { const p = createProject(' Name ',' Client ','website',''); assert.equal(p.name,'Name'); assert.equal(p.client,'Client'); assert.equal(p.screens.length,0); });
test('empty project cannot be signed',() => { const s=fixture(); s.projects[0].screens=[]; assert.equal(canSign(s,s.projects[0]),false); });
test('unreviewed screen has zero readiness',() => assert.equal(readiness(fixture().projects[0]),0));
test('screen accepts only when assets exist',() => { const s=fixture(); s.projects[0].screens[0].reference=''; assert.throws(() => acceptScreen(s,'p','s')); });
test('open issue blocks screen acceptance',() => { const s=addIssue(fixture(),issue()); assert.throws(() => acceptScreen(s,'p','s')); });
test('review-status issue also blocks acceptance',() => { const s=setIssueStatus(addIssue(fixture(),issue()),'i','review'); assert.equal(pendingFor(s,'p').length,1); assert.throws(() => acceptScreen(s,'p','s')); });
test('resolved issue permits screen acceptance',() => { const s=acceptScreen(setIssueStatus(addIssue(fixture(),issue()),'i','resolved'),'p','s'); assert.equal(isAccepted(s.projects[0].screens[0]),true); assert.equal(readiness(s.projects[0]),100); });
test('new version preserves prior version and resets acceptance',() => { let s=acceptScreen(fixture(),'p','s'); s=addVersion(s,'p','s',{...currentVersion(s.projects[0].screens[0])!,id:'v2'}); assert.equal(s.projects[0].screens[0].versions.length,2); assert.equal(isAccepted(s.projects[0].screens[0]),false); });
test('reopened issue resets screen acceptance',() => { let s=addIssue(fixture(),issue()); s=acceptScreen(setIssueStatus(s,'i','resolved'),'p','s'); s=setIssueStatus(s,'i','open'); assert.equal(isAccepted(s.projects[0].screens[0]),false); });
test('new issue invalidates a previously accepted screen',() => { const s=addIssue(acceptScreen(fixture(),'p','s'),issue()); assert.equal(isAccepted(s.projects[0].screens[0]),false); });
test('reference change invalidates acceptance',() => { const s=editScreen(acceptScreen(fixture(),'p','s'),'p','s',p=>({...p,referenceId:'ref2'})); assert.equal(isAccepted(s.projects[0].screens[0]),false); });
test('signoff requires accepted screens and name',() => { const s=fixture(); assert.throws(()=>signProject(s,'p','Name')); assert.throws(()=>signProject(acceptScreen(s,'p','s'),'p',' ')); });
test('valid signoff binds to current fingerprint',() => { const s=signProject(acceptScreen(fixture(),'p','s'),'p',' Client '); assert.equal(isSigned(s,s.projects[0]),true); assert.equal(s.projects[0].signoffs[0].fingerprint,fingerprint(s.projects[0])); assert.equal(s.projects[0].signoffs[0].by,'Client'); });
test('new version invalidates project signoff',() => { let s=signProject(acceptScreen(fixture(),'p','s'),'p','Client'); s=addVersion(s,'p','s',{...currentVersion(s.projects[0].screens[0])!,id:'v2'}); assert.equal(isSigned(s,s.projects[0]),false); s=acceptScreen(s,'p','s'); assert.equal(isSigned(s,s.projects[0]),false); });
test('issue cannot point at a missing version',() => { assert.throws(()=>addIssue(fixture(),{...issue(),versionId:'missing'})); });
test('annotation positions are clamped',() => { const s=addIssue(fixture(),{...issue(),x:-10,y:180}); assert.equal(s.issues[0].x,0); assert.equal(s.issues[0].y,100); });
test('report values escape markup',() => assert.equal(escapeHtml('<script>"x" & \'y\'</script>'),'&lt;script&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/script&gt;'));
test('unsafe URLs are rejected',() => { assert.equal(safeUrl('javascript:alert(1)'), ''); assert.equal(safeUrl('https://example.com'),'https://example.com/'); });
test('reducers leave previous workspace unchanged',() => { const s=fixture(), before=JSON.stringify(s); addIssue(s,issue()); assert.equal(JSON.stringify(s),before); });
