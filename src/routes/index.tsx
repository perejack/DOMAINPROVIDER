import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  AlertTriangle, ArrowLeft, ArrowRight, BadgeCheck, Bell, Check, CheckCircle2,
  ChevronDown, CircleHelp, CreditCard, ExternalLink, Globe2, LayoutDashboard,
  LockKeyhole, LogOut, Menu, MoreHorizontal, Rocket, Search, Server, Settings,
  ShieldCheck, Sparkles, X, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import earthOrbit from "@/assets/earth-orbit.jpg";
import { MpesaService } from "@/lib/mpesa";
import { toast } from "sonner";

export const Route = createFileRoute("/")(
  {
    head: () => ({ meta: [
      { title: "SpaceshipDomains — Domain Mission Control" },
      { name: "description", content: "Manage domains, renewals, security and billing from one modern workspace." },
      { property: "og:title", content: "SpaceshipDomains — Domain Mission Control" },
      { property: "og:description", content: "Manage domains, renewals, security and billing from one modern workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ]}), component: App,
  }
);

type View = "login" | "dashboard" | "checkout" | "success";
type Method = "card" | "mpesa" | null;

const RENEWAL_AMOUNT_KSH = 10; // Test amount

function Brand({ light = false }: { light?: boolean }) {
  return <div className={`flex items-center gap-3 ${light ? "text-primary-foreground" : "text-foreground"}`}>
    <span className="relative grid size-9 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm"><Rocket className="size-5" /><span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-destructive ring-2 ring-background" /></span>
    <span className="font-display text-lg font-bold">spaceship<span className="text-primary">domains</span></span>
  </div>;
}

function App() {
  const [view, setView] = useState<View>("login");
  const [showAlert, setShowAlert] = useState(true);
  const [mobileNav, setMobileNav] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  if (view === "login") return <Login onLogin={() => setView("dashboard")} />;
  return <Shell mobileNav={mobileNav} setMobileNav={setMobileNav} onLogout={() => setView("login")}>
    {view === "dashboard" && <Dashboard showAlert={showAlert} isPaid={isPaid} closeAlert={() => setShowAlert(false)} renew={() => setView("checkout")} />}
    {view === "checkout" && <Checkout back={() => setView("dashboard")} success={() => setView("success")} />}
    {view === "success" && <Success done={() => { setIsPaid(true); setShowAlert(false); setView("dashboard"); }} />}
  </Shell>;
}

function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return <main className="grid min-h-screen bg-background lg:grid-cols-[1.08fr_.92fr]">
    <section className="relative hidden min-h-screen overflow-hidden bg-ink lg:block">
      <img src={earthOrbit} width={1600} height={1200} alt="Earth seen from orbit with a communications satellite" className="absolute inset-0 h-full w-full object-cover opacity-75" />
      <div className="absolute inset-0 bg-ink/30" />
      <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
        <Brand light />
        <div className="max-w-xl animate-soft-in pb-10">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 bg-ink/40 px-3 py-1.5 text-xs font-bold uppercase"><Sparkles className="size-3.5 text-destructive" /> Domain mission control</span>
          <h1 className="font-display text-6xl font-semibold leading-[1.02]">Your corner of the internet. In orbit.</h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-primary-foreground/75">Launch, secure and manage every domain from a workspace built to keep you moving.</p>
          <div className="mt-10 flex gap-7 text-sm"><span className="flex items-center gap-2"><ShieldCheck className="text-primary" /> Protected</span><span className="flex items-center gap-2"><Zap className="text-destructive" /> Always on</span></div>
        </div>
      </div>
    </section>
    <section className="flex min-h-screen flex-col bg-panel px-6 py-7 sm:px-12 lg:px-20">
      <div className="lg:hidden"><Brand /></div>
      <div className="m-auto w-full max-w-md animate-soft-in py-12">
        <div className="mb-9"><p className="mb-3 text-sm font-bold uppercase text-primary">Welcome aboard</p><h2 className="font-display text-4xl font-semibold text-foreground">Sign in to mission control</h2><p className="mt-3 text-muted-foreground">Use any email and password for this demo.</p></div>
        <form onSubmit={(e) => { e.preventDefault(); onLogin(); }} className="space-y-5">
          <label className="block text-sm font-semibold">Email address<input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="captain@example.com" className="mt-2 h-12 w-full rounded-md border border-input bg-background px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" /></label>
          <label className="block text-sm font-semibold">Password<input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter any password" className="mt-2 h-12 w-full rounded-md border border-input bg-background px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" /></label>
          <div className="flex items-center justify-between text-sm"><label className="flex items-center gap-2 text-muted-foreground"><input type="checkbox" className="accent-primary" /> Remember me</label><button type="button" className="font-semibold text-primary">Forgot password?</button></div>
          <Button variant="hero" size="lg" className="h-12 w-full">Launch dashboard <ArrowRight /></Button>
        </form>
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground"><LockKeyhole className="size-3.5" /> Encrypted, private and protected</div>
      </div>
    </section>
  </main>;
}

function Shell({ children, onLogout, mobileNav, setMobileNav }: { children: React.ReactNode; onLogout: () => void; mobileNav: boolean; setMobileNav: (v:boolean)=>void }) {
  return <div className="min-h-screen bg-background">
    <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-panel px-4 md:px-7"><Button variant="ghost" size="icon" className="mr-2 lg:hidden" onClick={() => setMobileNav(!mobileNav)} aria-label="Open menu"><Menu /></Button><Brand /><div className="ml-auto flex items-center gap-2"><Button variant="ghost" size="icon" aria-label="Notifications"><Bell /></Button><div className="ml-2 hidden h-8 w-px bg-border sm:block" /><button className="ml-2 flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">TG</span><span className="hidden text-left sm:block"><b className="block text-xs">The Way Global</b><span className="text-[11px] text-muted-foreground">Owner account</span></span><ChevronDown className="size-4 text-muted-foreground" /></button></div></header>
    <aside className={`${mobileNav ? "translate-x-0" : "-translate-x-full"} fixed inset-y-16 left-0 z-20 w-64 border-r bg-panel p-4 transition-transform lg:translate-x-0`}><nav className="space-y-1"><Nav icon={LayoutDashboard} text="Overview" active /><Nav icon={Globe2} text="Domains" count="1" /><Nav icon={Server} text="DNS & Hosting" /><Nav icon={CreditCard} text="Billing" /><div className="my-5 border-t" /><Nav icon={Settings} text="Settings" /><Nav icon={CircleHelp} text="Help center" /></nav><div className="absolute bottom-5 left-4 right-4"><Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={onLogout}><LogOut /> Sign out</Button></div></aside>
    <main className="p-4 md:p-8 lg:ml-64">{children}</main>
  </div>;
}
function Nav({ icon: Icon, text, active, count }: { icon: typeof Globe2; text:string; active?:boolean; count?:string }) { return <button className={`flex h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-semibold ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}><Icon className="size-4" />{text}{count && <span className="ml-auto rounded-full bg-destructive px-2 py-0.5 text-[10px] text-destructive-foreground">{count}</span>}</button> }

function Dashboard({ showAlert, isPaid, closeAlert, renew }: { showAlert:boolean; isPaid:boolean; closeAlert:()=>void; renew:()=>void }) {
  return <div className="mx-auto max-w-6xl animate-soft-in">
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-primary">Friday, 2 October</p><h1 className="mt-1 font-display text-3xl font-semibold">Good morning, Commander.</h1><p className="mt-1 text-sm text-muted-foreground">Here's the status of your domain fleet.</p></div><Button variant="outline"><Search /> Find a new domain</Button></div>
    {isPaid && <div className="relative mb-7 overflow-hidden rounded-md border border-success/25 bg-success/8 p-5 shadow-sm"><div className="flex gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-full bg-success text-primary-foreground"><CheckCircle2 /></span><div><p className="font-display text-lg font-semibold text-success">Domain successfully renewed</p><p className="mt-1 text-sm leading-6 text-muted-foreground"><b className="text-foreground">thewayglobalministries.org</b> is now active. Your website and email services have been restored.</p></div></div></div>}
    {showAlert && !isPaid && <div className="relative mb-7 overflow-hidden rounded-md border border-destructive/25 bg-destructive/8 p-5 shadow-sm"><div className="flex gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-full bg-destructive text-destructive-foreground"><AlertTriangle /></span><div className="pr-8"><p className="font-display text-lg font-semibold text-destructive">Your domain has expired</p><p className="mt-1 text-sm leading-6 text-muted-foreground"><b className="text-foreground">thewayglobalministries.org</b> is currently offline. Kindly renew now to restore your website and email.</p><Button variant="destructive" className="mt-4" onClick={renew}>Renew for KSh {RENEWAL_AMOUNT_KSH} <ArrowRight /></Button></div></div><Button variant="ghost" size="icon" onClick={closeAlert} className="absolute right-3 top-3" aria-label="Dismiss alert"><X /></Button></div>}
    <div className="mb-7 grid gap-4 sm:grid-cols-3"><Stat label="Total domains" value="01" note="In your fleet" icon={Globe2}/><Stat label="Needs attention" value={isPaid ? "00" : "01"} note={isPaid ? "All systems go" : "Action required"} icon={isPaid ? ShieldCheck : AlertTriangle} danger={!isPaid}/><Stat label="Protection" value="On" note="Account secured" icon={ShieldCheck}/></div>
    <section><div className="mb-3 flex items-center justify-between"><h2 className="font-display text-xl font-semibold">Your domains</h2><Button variant="ghost" size="sm">View all <ArrowRight /></Button></div><div className="overflow-hidden rounded-md border bg-panel shadow-sm"><div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center"><span className="grid size-12 shrink-0 place-items-center rounded-md bg-primary/10 text-primary"><Globe2 /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate font-display text-lg font-semibold">thewayglobalministries.org</h3>{isPaid ? <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-bold text-success"><span className="size-1.5 rounded-full bg-success" /> ACTIVE</span> : <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive"><span className="size-1.5 rounded-full bg-destructive" /> EXPIRED</span>}</div><p className="mt-1 text-sm text-muted-foreground">{isPaid ? "Active · Renewed 2 October 2026 · Expires 2 December 2027" : "Expired 1 October 2026 · Website and email paused"}</p></div><div className="flex gap-2"><Button variant="outline" size="icon" aria-label="Visit domain"><ExternalLink /></Button>{!isPaid && <Button onClick={renew}>Renew now <ArrowRight /></Button>}<Button variant="ghost" size="icon" aria-label="More options"><MoreHorizontal /></Button></div></div><div className="grid border-t bg-muted/30 sm:grid-cols-3"><DomainInfo label="Auto-renew" value={isPaid ? "On" : "Off"} good={isPaid}/><DomainInfo label="Registration" value="SpaceshipDomains"/><DomainInfo label="Privacy shield" value="Protected" good/></div></div></section>
  </div>;
}
function Stat({label,value,note,icon:Icon,danger}:{label:string;value:string;note:string;icon:typeof Globe2;danger?:boolean}) { return <div className="rounded-md border bg-panel p-5 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase text-muted-foreground">{label}</p><p className={`mt-2 font-display text-3xl font-semibold ${danger ? "text-destructive":""}`}>{value}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></div><Icon className={danger?"text-destructive":"text-primary"}/></div></div> }
function DomainInfo({label,value,good}:{label:string;value:string;good?:boolean}) { return <div className="border-b p-4 last:border-0 sm:border-b-0 sm:border-r"><p className="text-[11px] font-bold uppercase text-muted-foreground">{label}</p><p className={`mt-1 text-sm font-semibold ${good?"text-success":""}`}>{good && <Check className="mr-1 inline size-3.5"/>}{value}</p></div> }

type PayState = "idle" | "sending" | "polling" | "done" | "failed";

function Checkout({ back, success }: { back:()=>void; success:()=>void }) {
  const [method, setMethod] = useState<Method>(null);
  const [phone, setPhone] = useState("");
  const [payState, setPayState] = useState<PayState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);

  const paying = payState === "sending" || payState === "polling";

  const pay = async () => {
    if (!phone || payState !== "idle") return;
    setErrorMsg(null);
    setPayState("sending");

    const result = await MpesaService.initiateSTKPush(
      phone,
      RENEWAL_AMOUNT_KSH,
      "DOMAIN-RENEW",
      "Domain Renewal Fee"
    );

    if (!result.success || !result.checkoutRequestId) {
      setErrorMsg(result.error ?? "Failed to initiate payment. Please try again.");
      setPayState("failed");
      return;
    }

    setCheckoutId(result.checkoutRequestId);
    setPayState("polling");

    MpesaService.pollPaymentStatus(
      result.checkoutRequestId,
      () => {
        setPayState("done");
        success();
      },
      (errMsg) => {
        setErrorMsg(errMsg ?? "Payment failed or was cancelled.");
        setPayState("failed");
      }
    );
  };

  const retry = () => {
    setPayState("idle");
    setErrorMsg(null);
    setCheckoutId(null);
  };

  return <div className="mx-auto max-w-5xl animate-soft-in">
    <button onClick={back} className="mb-5 flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4"/> Back to dashboard</button>
    <div className="mb-7"><p className="text-sm font-semibold text-primary">Secure renewal</p><h1 className="mt-1 font-display text-3xl font-semibold">Restore your domain</h1></div>
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <section className="rounded-md border bg-panel p-5 shadow-sm sm:p-7">
        <div className="mb-6">
          <h2 className="font-display text-xl font-semibold">Choose payment method</h2>
          <p className="mt-1 text-sm text-muted-foreground">Complete your domain renewal securely via M-Pesa.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <MethodCard title="Card" note="Visa or Mastercard" active={method==="card"} onClick={()=>setMethod("card")} icon={<CreditCard/>}/>
          <MethodCard title="M-Pesa" note="Pay from your phone" active={method==="mpesa"} onClick={()=>setMethod("mpesa")} icon={<span className="font-display text-sm font-bold text-success">M-PESA</span>}/>
        </div>

        {method==="card" && <div className="mt-5 rounded-md border border-destructive/20 bg-destructive/5 p-5"><div className="flex gap-3"><AlertTriangle className="shrink-0 text-destructive"/><div><h3 className="font-semibold">Card payments are under maintenance</h3><p className="mt-1 text-sm text-muted-foreground">Please use M-Pesa to complete this renewal.</p><Button className="mt-4" onClick={()=>setMethod("mpesa")}>Use M-Pesa instead</Button></div></div></div>}

        {method==="mpesa" && <div className="mt-5 animate-soft-in rounded-md border bg-background p-5">
          <div className="mb-5 flex items-center justify-between border-b pb-4">
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">Amount due</p>
              <p className="font-display text-2xl font-semibold">KSh {RENEWAL_AMOUNT_KSH}</p>
            </div>
            <span className="rounded-full bg-success/10 px-3 py-1.5 text-xs font-bold text-success">M-PESA</span>
          </div>

          {payState === "idle" || payState === "failed" ? (<>
            <label className="block text-sm font-semibold">M-Pesa phone number
              <input value={phone} onChange={e=>setPhone(e.target.value)} type="tel" placeholder="07XX XXX XXX" className="mt-2 h-12 w-full rounded-md border border-input bg-panel px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
            </label>
            <p className="mt-2 text-xs text-muted-foreground">An M-Pesa STK push prompt will be sent to this number.</p>
            {errorMsg && <div className="mt-3 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"><AlertTriangle className="mt-0.5 size-4 shrink-0"/><span>{errorMsg}</span></div>}
            <Button variant="hero" className="mt-5 h-12 w-full" disabled={phone.replace(/\D/g,"").length<9} onClick={pay}>
              Pay KSh {RENEWAL_AMOUNT_KSH} via M-Pesa <ArrowRight/>
            </Button>
          </>) : payState === "sending" ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <span className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent"/>
              <div>
                <p className="font-semibold">Sending STK Push…</p>
                <p className="mt-1 text-sm text-muted-foreground">Please wait while we contact your phone.</p>
              </div>
            </div>
          ) : payState === "polling" ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <span className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent"/>
              <div>
                <p className="font-semibold">Waiting for payment…</p>
                <p className="mt-1 text-sm text-muted-foreground">Check your phone for the M-Pesa prompt and enter your PIN.</p>
              </div>
              <button onClick={retry} className="text-xs text-muted-foreground underline">Cancel and retry</button>
            </div>
          ) : null}
        </div>}
      </section>

      <aside className="h-fit rounded-md bg-ink p-6 text-primary-foreground shadow-float">
        <div className="mb-6 flex items-center justify-between"><span className="text-sm font-semibold">Renewal summary</span><Rocket className="text-primary"/></div>
        <p className="break-all font-display text-lg font-semibold">thewayglobalministries.org</p>
        <div className="my-5 border-t border-primary-foreground/15"/>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between text-primary-foreground/65"><span>Renewal period</span><b className="text-primary-foreground">14 months</b></div>
          <div className="flex justify-between text-primary-foreground/65"><span>Domain privacy</span><b className="text-success">Included</b></div>
          <div className="flex justify-between text-primary-foreground/65"><span>ICANN fee</span><b className="text-primary-foreground">Included</b></div>
        </div>
        <div className="my-5 border-t border-primary-foreground/15"/>
        <div className="flex items-end justify-between"><span className="font-semibold">Total</span><span className="font-display text-3xl font-semibold">KSh {RENEWAL_AMOUNT_KSH}</span></div>
        <div className="mt-5 flex items-center gap-2 text-xs text-primary-foreground/55"><LockKeyhole className="size-3.5"/> Secured via M-Pesa · PayHero</div>
      </aside>
    </div>
  </div>;
}

function MethodCard({title,note,icon,active,onClick}:{title:string;note:string;icon:React.ReactNode;active:boolean;onClick:()=>void}) { return <button onClick={onClick} className={`flex h-24 items-center gap-4 rounded-md border p-4 text-left transition ${active?"border-primary bg-primary/5 ring-2 ring-primary/15":"bg-panel hover:border-primary/50"}`}><span className="grid size-12 place-items-center rounded-md bg-muted text-primary">{icon}</span><span className="flex-1"><b className="block">{title}</b><span className="text-xs text-muted-foreground">{note}</span></span><span className={`grid size-5 place-items-center rounded-full border ${active?"border-primary bg-primary text-primary-foreground":"border-input"}`}>{active&&<Check className="size-3"/>}</span></button> }

function Success({ done }: { done:()=>void }) {
  const [burst,setBurst]=useState(true); useEffect(()=>{const t=setTimeout(()=>setBurst(false),2200);return()=>clearTimeout(t)},[]);
  return <div className="relative mx-auto flex min-h-[calc(100vh-8rem)] max-w-4xl items-center justify-center overflow-hidden"><div className="relative z-10 w-full max-w-2xl animate-soft-in rounded-md border bg-panel p-7 text-center shadow-float sm:p-12"><div className="relative mx-auto mb-6 grid size-24 place-items-center"><div className="absolute inset-0 animate-orbit rounded-full border border-dashed border-primary/40"/><span className="grid size-16 place-items-center rounded-full bg-success text-primary-foreground"><CheckCircle2 className="size-9"/></span></div><span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs font-bold uppercase text-success"><BadgeCheck className="size-3.5"/> Domain active</span><h1 className="mt-5 font-display text-4xl font-semibold">You're back in orbit.</h1><p className="mx-auto mt-3 max-w-lg text-muted-foreground"><b className="text-foreground">thewayglobalministries.org</b> is active again. Website and email services are being restored.</p><div className="my-8 grid overflow-hidden rounded-md border bg-background text-left sm:grid-cols-2"><div className="border-b p-5 sm:border-b-0 sm:border-r"><p className="text-xs font-bold uppercase text-muted-foreground">Renewal period</p><p className="mt-1 font-display text-xl font-semibold">14 months</p></div><div className="p-5"><p className="text-xs font-bold uppercase text-muted-foreground">Active until</p><p className="mt-1 font-display text-xl font-semibold">2 December 2027</p></div></div><Button variant="hero" size="lg" onClick={done}>Return to dashboard <ArrowRight/></Button><p className="mt-5 text-xs text-muted-foreground">Payment confirmed via M-Pesa · PayHero</p></div>{burst&&<div className="pointer-events-none absolute inset-0"><span className="absolute left-[16%] top-[18%] size-2 rounded-full bg-primary animate-bounce"/><span className="absolute right-[18%] top-[25%] size-2 rounded-full bg-destructive animate-bounce"/><span className="absolute bottom-[22%] left-[24%] size-2 rounded-full bg-success animate-bounce"/></div>}</div>;
}