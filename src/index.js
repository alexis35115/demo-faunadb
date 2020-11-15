const app = require('express')();
const faunadb = require('faunadb');
const client = new faunadb.Client({ secret: 'YOUR-KEY' })

// Faire l'inclusion
const {
    Ref,
    Paginate,
    Get,
    Match,
    Index,
    Create,
    Collection,
    Join,
    Call,
    Function: Fn,
} = faunadb.query;

// Obtenir un tweet par son identifiant
app.get('/tweet/:id', async (req, res) => {

    const doc = await client.query(
        Get(
            Ref(
                Collection('tweets'),
                req.params.id
            )
        )
    );

    res.send(doc);
});

// Créer un tweet
app.post('/tweet', async (req, res) => {

    const data = {
        // Code original avant la mise en place d'une fonction
        // Select('ref', Get(Match(Index('users_by_name'), 'codewithfrenchy')))
        user: Call(Fn("getUser"), 'codewithfrenchy'),
        text: 'Hooooola'
    };

    const doc = await client.query(
        Create(
            Collection('tweets'),
            { data }
        )
    );

    res.send(doc);
});

// Obtenir les tweets de 'codewithfrenchy'
app.get('/tweet', async (req, res) => {

    const docs = await client.query(
        Paginate(
            Match(
                Index('tweets_by_user'),
                Call(Fn("getUser"), 'codewithfrenchy')
            )
        )
    );

    res.send(docs);
});

// Obtenir les relations
app.post('/relationship', async (req, res) => {

    const data = {
        follower: Call(Fn("getUser"), 'bob'),
        followee: Call(Fn("getUser"), 'codewithfrenchy')
    };

    const doc = await client.query(
        Create(
            Collection('relationships'),
            { data }
        )
    );

    res.send(doc);
});

// Obtenir tous les comptes et les tweets de toutes les personnes que je follow (de codewithfrenchy)
app.get('/feed', async (req, res) => {
    const docs = await client.query(
        Paginate(
            Join(
                Match(
                    Index('followees_by_follower'),
                    Call(Fn("getUser"), 'codewithfrenchy')
                ),
                Index('tweets_by_user'),
            )
        )
    );

    res.send(docs);
});


app.listen(5000, () => console.log('API on http://localhost:5000'));