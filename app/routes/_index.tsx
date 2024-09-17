import { useState } from 'react';
import type { MetaFunction } from '@remix-run/react';
import { Bar } from 'react-chartjs-2';
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const meta: MetaFunction = () => {
	return [
		{ title: 'Git Commit Analyzer' },
		{
			property: 'og:title',
			content: 'Git Commit Analyzer',
		},
		{
			name: 'description',
			content: 'Analyze your git commit logs',
		},
	];
};

export default function Index() {
	const [gitLog, setGitLog] = useState('');
	const [error, setError] = useState('');

	interface ChartData {
		labels: string[];
		datasets: {
			label: string;
			data: number[];
			backgroundColor: string;
		}[];
	}

	const [chartData, setChartData] = useState<ChartData | null>(null);
	const [viewType, setViewType] = useState<
		| 'authorName'
		| 'authorEmail'
		| 'commit'
		| 'weekDay'
		| 'dayOfMonth'
		| 'month'
		| 'year'
		| 'hour'
		| 'date'
	>('date');

	const [metricType, setMetricType] = useState<'changes' | 'commits'>('changes');

	const handleAnalyze = () => {
		if (!gitLog) {
			setError('No logs have been entered.');
			return;
		}

		const data = parseGitLog(gitLog);

		if (data.length === 0) {
			setError('No valid logs have been entered.');
			return;
		}

		setError('');
		const generatedChartData = generateChartData(data, viewType, metricType);
		setChartData(generatedChartData);
	};

	const parseGitLog = (log: string) => {
		const lines = log.split('\n');
		const commitRegex = /^commit\s([a-f0-9]{40})$/;
		const authorRegex = /^Author:\s+(.*)\s<(.+)>$/;
		const dateRegex = /^Date:\s+(.*)$/;
		const numstatRegex = /^(\d+|-)\s+(\d+|-)\s+(.*)$/;

		let currentCommit = '';
		let currentDate = '';
		let currentAuthorName = '';
		let currentAuthorEmail = '';
		const data: {
			[key: string]: {
				insertions: number;
				deletions: number;
				authorName: string;
				authorEmail: string;
				commit: string;
				date: string;
				weekDay: string;
				dayOfMonth: string;
				month: string;
				year: string;
				hour: string;
			};
		} = {};

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];

			const commitMatch = line.match(commitRegex);
			if (commitMatch) {
				currentCommit = commitMatch[1];
				continue;
			}

			const authorMatch = line.match(authorRegex);
			if (authorMatch) {
				currentAuthorName = authorMatch[1];
				currentAuthorEmail = authorMatch[2];
				continue;
			}

			const dateMatch = line.match(dateRegex);
			if (dateMatch) {
				const date = new Date(dateMatch[1]);
				currentDate = date.toISOString();
				continue;
			}

			const numstatMatch = line.match(numstatRegex);
			if (numstatMatch && currentDate && currentAuthorName && currentAuthorEmail && currentCommit) {
				const insertions = numstatMatch[1] === '-' ? 0 : parseInt(numstatMatch[1], 10);
				const deletions = numstatMatch[2] === '-' ? 0 : parseInt(numstatMatch[2], 10);

				const dateObj = new Date(currentDate);
				const key = `${currentCommit}-${numstatMatch[3]}`;

				data[key] = {
					insertions,
					deletions,
					authorName: currentAuthorName,
					authorEmail: currentAuthorEmail,
					commit: currentCommit,
					date: dateObj.toISOString().split('T')[0],
					weekDay: dateObj.toLocaleString('en-US', { weekday: 'long' }),
					dayOfMonth: dateObj.getDate().toString(),
					month: (dateObj.getMonth() + 1).toString(),
					year: dateObj.getFullYear().toString(),
					hour: dateObj.getHours().toString(),
				};
			}
		}

		return Object.values(data);
	};

	interface GitLogEntry {
		insertions: number;
		deletions: number;
		authorName: string;
		authorEmail: string;
		commit: string;
		date: string;
		weekDay: string;
		dayOfMonth: string;
		month: string;
		year: string;
		hour: string;
	}

	const generateChartData = (
		data: GitLogEntry[],
		viewType: string,
		metricType: 'changes' | 'commits'
	): ChartData => {
		const groupData: {
			[key: string]: { insertions: number; deletions: number; commits: Set<string> };
		} = {};

		data.forEach((entry) => {
			const key = entry[viewType as keyof GitLogEntry];
			if (!groupData[key]) {
				groupData[key] = { insertions: 0, deletions: 0, commits: new Set() };
			}
			groupData[key].insertions += entry.insertions;
			groupData[key].deletions += entry.deletions;
			groupData[key].commits.add(entry.commit);
		});

		let sortedKeys = Object.keys(groupData);

		if (
			viewType === 'hour' ||
			viewType === 'dayOfMonth' ||
			viewType === 'month' ||
			viewType === 'year'
		) {
			sortedKeys = sortedKeys.sort((a, b) => parseInt(a) - parseInt(b)); // Sort numerically
		} else {
			sortedKeys = sortedKeys.sort(); // Default lexicographical sort
		}

		if (metricType === 'changes') {
			return {
				labels: sortedKeys,
				datasets: [
					{
						label: 'Insertions',
						data: sortedKeys.map((key) => groupData[key].insertions),
						backgroundColor: 'rgba(75,192,192,0.4)',
					},
					{
						label: 'Deletions',
						data: sortedKeys.map((key) => groupData[key].deletions),
						backgroundColor: 'rgba(255,99,132,0.4)',
					},
				],
			};
		} else {
			return {
				labels: sortedKeys,
				datasets: [
					{
						label: 'Number of Commits',
						data: sortedKeys.map((key) => groupData[key].commits.size),
						backgroundColor: 'rgba(153,102,255,0.4)',
					},
				],
			};
		}
	};

	return (
		<div className='min-h-screen bg-gray-100 p-4'>
			<div className='max-w-3xl mx-auto'>
				{!chartData && (
					<>
						{/* Display recommended command */}
						<div className='bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4'>
							<p className='font-bold'>Note:</p>
							<p>
								Please use the following command to obtain the git log:
								<code className='bg-gray-100 p-1.5 rounded block my-2'>
									git log --numstat --date=iso-strict &gt; gitlog.txt
								</code>
								Please paste the outputted log into the text area.
							</p>
						</div>
						{error && (
							<div className='bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4'>
								<p className='font-bold'>Error:</p>
								{error}
							</div>
						)}
						<textarea
							value={gitLog}
							onChange={(e) => setGitLog(e.target.value)}
							rows={10}
							className='w-full p-2 border-2 border-gray-200 mb-4 resize-none'
							placeholder='Please paste the git log here'
						/>
						<button
							onClick={handleAnalyze}
							className='w-full bg-blue-500 text-white py-2 hover:bg-blue-600 mb-4'
						>
							Analyze
						</button>
					</>
				)}
				{chartData && (
					<div className='bg-white p-4 border-2 border-gray-200'>
						<h2 className='text-2xl font-bold mb-4'>Analysis Results</h2>
						<div className='mb-4'>
							<label htmlFor='viewType' className='mr-2 font-bold'>
								View Type:
							</label>
							<select
								id='viewType'
								value={viewType}
								onChange={(e) => {
									const newViewType = e.target.value as typeof viewType;
									setViewType(newViewType);
									const data = parseGitLog(gitLog);
									const generatedChartData = generateChartData(data, newViewType, metricType);
									setChartData(generatedChartData);
								}}
								className='p-2 border border-gray-300 rounded'
							>
								<option value='authorName'>By Author Name</option>
								<option value='authorEmail'>By Author Email</option>
								<option value='commit'>By Commit</option>
								<option value='weekDay'>By Weekday</option>
								<option value='dayOfMonth'>By Day of Month</option>
								<option value='month'>By Month</option>
								<option value='year'>By Year</option>
								<option value='hour'>By Hour</option>
								<option value='date'>By Date</option>
							</select>
						</div>
						<div className='mb-4'>
							<label htmlFor='metricType' className='mr-2 font-bold'>
								Metric Type:
							</label>
							<select
								id='metricType'
								value={metricType}
								onChange={(e) => {
									const newMetricType = e.target.value as 'changes' | 'commits';
									setMetricType(newMetricType);
									const data = parseGitLog(gitLog);
									const generatedChartData = generateChartData(data, viewType, newMetricType);
									setChartData(generatedChartData);
								}}
								className='p-2 border border-gray-300 rounded'
							>
								<option value='changes'>Insertions & Deletions</option>
								<option value='commits'>Number of Commits</option>
							</select>
						</div>
						<Bar data={chartData} />
					</div>
				)}
			</div>
		</div>
	);
}
