const express = require('express');
const cors = require('cors')

const app = express();
app.use(cors())
app.use(express.json());

const port = 8080;

const promos = [];
const prizes = [];
const participants = [];

app.post('/promo', (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  const promo = {
    id: promos.length + 1,
    name,
    description,
    prizes: prizes,
    participants: participants
  };
  promos.push(promo);
  res.json(promo.id);
});

app.get('/promo', (req, res) => {
    const promoList = promos.map(({ id, name, description }) => ({ id, name, description }));
    res.json(promoList);
})

app.get('/promo/:id', (req, res) => {
    const promoId = parseInt(req.params.id);
    const promo = promos.find(p => p.id === promoId);
    if (!promo) {
      return res.status(404).json({ error: 'Promo not found' });
    } 

    res.json(promo);
});


app.put('/promo/:id', (req, res) => {
    const promoId = parseInt(req.params.id);
    const promo = promos.find(p => p.id === promoId);
    if (!promo) {
      return res.status(404).json({ error: 'Promo not found' });
    }
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    promo.name = name;
    promo.description = description || undefined;
    res.json({ message: 'Promo updated successfully' });
});


app.delete('/promo/:id', (req, res) => {
    const promoId = parseInt(req.params.id);
    const promoIndex = promos.findIndex(p => p.id === promoId);
    if (promoIndex === -1) {
      return  res.status(404).json({ error: 'Promo not found' });
    } 

    promos.splice(promoIndex, 1);
    res.json({ message: 'Promo deleted successfully' });
});


app.post('/promo/:id/participant', (req, res) => {
    const promoId = parseInt(req.params.id);  
    const promo = promos.find(p => p.id === promoId);
    if (!promo) {
      return res.status(404).json({ error: 'Promo not found' });
    }

    const { name } = req.body;
    const participant = {
        id: participants.length + 1,
        name
    };
    participants.push(participant);
    res.json(participant.id);
  }
);

app.delete('/promo/:promoId/participant/:participantId', (req, res) => {
    const promoId = parseInt(req.params.promoId);  
    const promo = promos.find(p => p.id === promoId);
    if (!promo) {
      return res.status(404).json({ error: 'Promo not found' });
    } 

    const participantId = parseInt(req.params.participantId);
    const participantIndex = participants.findIndex(p => p.id === participantId);
    if (participantIndex === -1) {
        return res.status(404).json({ error: 'Participant not found in promo' });
    } 
    participants.splice(participantIndex, 1);
    res.json({ message: 'Participant deleted successfully' });
});

app.post('/promo/:id/prize', (req, res) => {
    const promoId = parseInt(req.params.id);
    const promo = promos.find(p => p.id === promoId);
    if (!promo) {
      return res.status(404).json({ error: 'Promo not found' });
    } 

    const { description } = req.body;
    const prize = {
        id: prizes.length + 1,
        description
    };
    prizes.push(prize);
    res.json(prize.id);
});

app.delete('/promo/:promoId/prize/:prizeId', (req, res) => {
    const promoId = parseInt(req.params.promoId);
    const promo = promos.find(p => p.id === promoId);
    if (!promo) {
      return res.status(404).json({ error: 'Promo not found' });
    } 
    const prizeId = parseInt(req.params.prizeId);
    const prizeIndex = prizes.findIndex(p => p.id === prizeId);
    if (prizeIndex === -1) {
      return res.status(404).json({ error: 'Prize not found in promo' });
    } 
    prizes.splice(prizeIndex, 1);
    res.json({ message: 'Prize deleted successfully' });
});


app.post('/promo/:id/raffle', (req, res) => {
    const promoId = parseInt(req.params.id);
    const promo = promos.find(p => p.id === promoId);
    if (!promo) {
      return res.status(404).json({ error: 'Promo not found' });
    } 

    if (participants.length !== prizes.length) {
      return res.status(409).json({ error: 'Cannot raffle, number of participants and prizes do not match' });
    } 

    const shuffledParticipants = shuffleArray(participants);
    const shuffledPrizes = shuffleArray(prizes);
  
    const raffleResults = shuffledParticipants.map((participant, index) => ({
        winner: participant,
        prize: shuffledPrizes[index]
    }));

    res.json(raffleResults);
});

function shuffleArray(array) {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})