import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/client";
import Head from "next/head";
import Link from "next/link";

import sendItData from "../../data/send-it-data";
import magnebotData from "../../data/magnebot-data";
import lineFollowingData from "../../data/line-following-data";

import Research from "../../components/Project/Research";
import Plan from "../../components/Project/Plan";
import Create from "../../components/Project/Create";
import Improve from "../../components/Project/Improve";
import Imagine from "../../components/Project/Imagine";
import Define from "../../components/Project/Define";
import Review from "../../components/Project/Review";
import Play from "../../components/Play";
import Code from "../../components/Code/Code";

import classes from "/styles/ProjectView.module.scss";

const get_data = (query) => {
  switch (query) {
    case "send-it":
      return sendItData;
    case "line-following":
      return lineFollowingData;
    case "magnebot":
      return magnebotData;
  }
};

const steps = [
  { title: "Imagine", icon: "filter_drama" },
  { title: "Define", icon: "biotech" },
  { title: "Research", icon: "travel_explore" },
  { title: "Plan", icon: "design_services" },
  { title: "Create", icon: "smart_toy" },
  { title: "Improve", icon: "auto_graph" },
  { title: "Review", icon: "checklist" },
];

const ProjectView = ({ setLoaded }) => {
  const router = useRouter();
  const [session, loading] = useSession();
  const [data, setData] = useState({});
  const [step, setStep] = useState("Imagine");
  const [view, setView] = useState("Project");

  useEffect(() => setLoaded(true), []);

  useEffect(() => {
    if (Object.keys(router.query).length) {
      setData(get_data(router.query.project));
      if (router.query.projectView) {
        const subQuery = router.query.projectView[0];
        if (subQuery === "play") {
          setView(subQuery[0].toUpperCase() + subQuery.substring(1));
          setLoaded(false);
        } else if (subQuery === "code") {
          setView(subQuery[0].toUpperCase() + subQuery.substring(1));
          setStep(
            router.query.projectView[1][0].toUpperCase() +
              router.query.projectView[1].substring(1)
          );
          setLoaded(false);
        } else {
          setView("Project");
          setStep(subQuery[0].toUpperCase() + subQuery.substring(1));
        }
      } else {
        setView("Project");
      }
    }
  }, [router.query]);

  if (loading || !data.query) return null;

  if (!session && view === "Project" && data.query !== "magnebot") {
    router.replace("/auth");
    return null;
  }

  console.log(session);

  return (
    <div className={classes.projectView}>
      <Head>
        <title>
          {view === "Project" ? step : view} • {data.name} | CreateBase
        </title>
        <meta name="description" content={data.caption} />
      </Head>
      {view === "Project" && (
        <>
          <div className={classes.tabContainer}>
            <Link href="/browse">
              <button className={classes.backBtn}>
                <span className="material-icons-outlined">arrow_back_ios</span>
                Browse
              </button>
            </Link>
            {steps.map((s, i) => (
              <button
                key={i}
                className={`${classes.tabWrapper} ${
                  step === s.title ? classes.activeTab : ""
                }`}
                onClick={() =>
                  router.push({
                    pathname: `/${data.query}/${s.title.toLowerCase()}`,
                  })
                }
              >
                <div className={classes.tab}>
                  <span className="material-icons-outlined">{s.icon}</span>
                  {s.title}
                </div>
              </button>
            ))}
          </div>
          <div className={classes.viewContainer}>
            {step === "Imagine" && <Imagine data={data.situation} />}
            {step === "Define" && (
              <Define data={data.define} caption={data.defineCaption} />
            )}
            {step === "Research" && (
              <Research
                query={data.query}
                data={data.research}
                caption={data.researchCaption}
              />
            )}
            {step === "Plan" && <Plan data={data.plan} />}
            {step === "Create" && (
              <Create query={data.query} data={data.create} />
            )}
            {step === "Improve" && (
              <Improve query={data.query} data={data.improve} />
            )}
            {step === "Review" && <Review />}
          </div>
        </>
      )}
      {view === "Code" && (step === "Create" || step === "Improve") && (
        <Code setLoaded={setLoaded} mode={step} project={data} />
      )}
      {view === "Play" && <Play setLoaded={setLoaded} project={data} />}
    </div>
  );
};

export default ProjectView;
