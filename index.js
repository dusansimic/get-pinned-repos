const micro = require('micro');
const cors = require('micro-cors')();
const { send } = micro;
const url = require('url');
const got = require('got');
const config = require('./config');

const server = micro(cors(async (req, res) => {
	let {pathname} = url.parse(req.url);

	if (pathname.startsWith('/')) pathname = pathname.slice(1);
	if (pathname.indexOf('/') !== -1) pathname = pathname.slice(0, pathname.indexOf('/'));

	if (pathname === 'favicon.ico') {
		return send(res, 200);
	}

	try {
		const response = await got.post('https://api.github.com/graphql', {
			headers: {
				'Authorization': `bearer ${config.accessToken}`
			},
			body: {
				query: `query {
					user(login: "${pathname}") {
						pinnedRepositories(first: 6) {
							nodes {
								name,
								description,
								owner {
									login
								},
								url,
								languages(first: 1) {
									nodes {
										color,
										name
									}
								},
								stargazers {
									totalCount
								},
								forkCount
							}
						}
					}
				}`
			},
			json: true
		});

		const {body} = response;

		send(res, 200, body);
	} catch (error) {
		send(res, 500, error);
	}
}));

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', err => {
	if (err) {
		throw err;
	}
	console.log(`Listening on port ${PORT}`);
});
