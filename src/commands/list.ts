import * as commander from 'commander';
import { EggHead, Technology } from '../egghead';
import * as chalk from 'chalk';
import { handleErrorAndExit } from '../common';
import { Config } from '../config';
const pkg = require('../../package.json');

commander
	.command('list')
	.description('Lists all courses')
	.action(() => {
		console.log();

		Config.load().then(config => {
			if (!config.data.email || !config.data.password) {
				console.log(chalk.red(`Email and/or password have not been set.`));
				console.log('');
				console.log(`Please set using: `);
				console.log('');
				console.log(`  ${pkg.name} config -e <email> -p <password>`);
				console.log();
				return;
			}

			return listCourses(config.data.email, config.data.password);
		});
	});

function listCourses(emailAddress: string, password: string) {
	const egghead = new EggHead();
	return egghead
		.authenticate({ emailAddress, password })
		.then(() => egghead.getCourses(), err => handleErrorAndExit(err))
		.then(technologies => {
			const allCourses = technologies
				.map(technology => technology.courses)
				.reduce((result, courses) => result.concat(courses), []);
			
			const totalLessonCount = allCourses
				.map(course => course.lessonCount)
				.reduce((total, count) => total + count, 0);

			console.log();
			console.log('Course Listing: ' + chalk.yellow(`${totalLessonCount} lessons over ${allCourses.length} courses over ${technologies.length} technologies`));
			console.log();
			
			for (const technology of technologies) {
				console.log(technology.name + chalk.yellow(` (${technology.courses.length} courses)`));
				console.log();
				for (const course of technology.courses) {
					console.log(` • ${course.name}` + chalk.yellow(` (${course.lessonCount} lessons)`));
				}
				console.log();
			}
		});
}