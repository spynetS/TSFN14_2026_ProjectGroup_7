import React, { useEffect, useState } from "react";
import type { User } from "~/models/User";
import LineChartComponent from "~/components/LineChartComponent";
import Page from "~/components/page";
import Popup from "~/components/popup";
import { Link } from "react-router";
import { apiFetch } from "~/api";

type StrengthPoint = {
	date: Date;
	strength: number;
}

type StrengthProgress = {
	muscleGroup: string;
	strengthPoints: StrengthPoint[]
	progress: number;
}

type Stats = {
	sessions: number;
	weightProgress: number;
	strengthProgress: {
		strengthData: StrengthProgress[];
	}

};

const Dashboard = () => {
  const [user, setUser] = useState<User>();
  const [search, _setSearch] = useState<string>("");
  const [show, setShow] = useState<boolean>(false);
  const [alert, setAlert] = useState<boolean>(false);
  const [weight, setWeight] = useState<string>("");
  const [graphTab, setGraphTab] = useState<number>(0);

	useEffect(() => {
		fetchData();
	}, []);


	//stats
	const [stats, setStats] = useState<Stats>()
	const [graphStrength, setGraphStrength] = useState<unknown>();

	const logWeight = () => {
		apiFetch("/api/log-weight", {
			method: "POST",
			body: JSON.stringify({ weight: weight }),
		})
			.then((val) => {

				if (val.status === "success") {
					setWeight("");
					setAlert(true);
					fetchData();
				}

			})
			.catch(() => {});
	};

	const fetchData = () => {
		apiFetch("/api/get-user/" + search).then(response => {
			if (response.status !== "success") throw new Error("Network response was not ok");
			setUser(response.data)

		})

		apiFetch("/api/stats").then(response => {
			if (response.status !== "success") throw new Error("Network response was not ok");

			const _stats: Stats = response.data
			setStats(_stats)


			const datas: Data[] = [];

			// First, find the max number of points
			const maxPoints = Math.max(
				...(_stats?.strengthProgress.strengthData ?? []).map(progress => progress.strengthPoints?.length || 0)
			);

			_stats?.strengthProgress.strengthData.forEach(progress => {
				datas.push({
					data: progress.strengthPoints?.map(point => point.strength) || [],
					labels: Array.from({ length: maxPoints }, (_, i) => i + 1), // [1, 2, 3, ...maxPoints]
					label: progress.muscleGroup,
					title: "",
				});
			});

			setGraphStrength(datas)
		})
	}



	return (
		<Page>




			<Popup
				show={show}
				setShow={setShow}
				setAlert={() => setAlert(false)}
				alert={alert}
				alertText="Your weight was logged"
				heading="Log your weight"
				description="Here you can log your weight"
				onSave={logWeight}
				inputs={(
					<div>
						<input className="input input-bordered" placeholder={user?.weightLogs.length > 0 ? user?.weightLogs[user?.weightLogs.length - 1].weight : 0} value={weight} onChange={e => setWeight(e.target.value)} />
					</div>
				)}
			/>

			<div className='gap-5 grid grid-cols-2 grid-rows-2 w-full row-span-2 h-2/5'>
				<div className="stats shadow bg-base-300">
					<div className="stat">
						<div className="stat-title">Total sessions</div>
						<div className="stat-value">{stats?.sessions}</div>
						<div className="stat-desc">21% more than</div>
					</div>
				</div>
				<div className="stats shadow bg-base-200 row-span-2">
					<div className="stat">
						<div className="stat-title">Next workout</div>
						<div className="text-xl stat-value">Upper body</div>
						<div className="stat-desc"></div>
					</div>
				</div>
				<div className="stats shadow bg-base-200">
					<div className="stat">
						<div className="stat-title">Weight goal ({user?.weightGoal}kgs)</div>
						<div className="stat-value">{stats?.weightProgress}%</div>
						<div className="stat-desc">21% more </div>
					</div>
				</div>
			</div>
			<div className="row-span-2 mt-7">
				<h2 className='text-xl font-semibold'>Weekly {graphTab == 0 ? "Weight" : "Strength"}</h2>
			</div>
			<div className='flex flex-col justify-between h-3/7 mt-2'>
				<div role="tablist" className="tabs tabs-box w-full grid grid-cols-2">
					<a role="tab" onClick={() => setGraphTab(0)} className={`tab ${graphTab == 0 ? "tab-active" : ""}`}>Weight</a>
					<a role="tab" onClick={() => setGraphTab(1)} className={`tab ${graphTab == 1 ? "tab-active" : ""}`} >Strength</a>
				</div>
				<div className="bg-base-200 flex h-full w-full items-center justify-center rounded-lg">
					{graphTab == 0 ? (
						<LineChartComponent
							datas={[{
								labels: user?.weightLogs.map(log => log.date),
								data: user?.weightLogs.map(log => log.weight),
								label: "Weight",
								title: "Weight over time"
							}]} />

					) :
						(<LineChartComponent
							datas={graphStrength} />
						)}

				</div>

				<div className="mt-5 flex flex-row items-end gap-2 w-full justify-around">
					<Link to="/workout" className='btn btn-lg btn-secondary'>
						Log Excercise
					</Link>
					<button onClick={() => { setShow(true) }} className='btn btn-lg btn-secondary'>
						Log Weight
					</button>
				</div>
			</div>

		</Page>
	)
}

export default Dashboard;
