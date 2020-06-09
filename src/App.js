import React from 'react'
import { range, isEqual, flatten, last, isEmpty, cloneDeep } from 'lodash'
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useParams
} from "react-router-dom";

export default function ParamsExample() {
  return (
    <Router>
      <Switch>
        <Route path="/:nPins/:nDisks">
          <GameRouter />
        </Route>
      </Switch>
    </Router>
  );
}

const useStyles = makeStyles((theme) => ({
  fab: {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    '& > *': { marginTop: theme.spacing(1) },
    bottom: theme.spacing(1),
    right: theme.spacing(1),
  }
}));

const GameRouter = () => {
  let { nPins = 4, nDisks = 5 } = useParams();
  return <Game nPins={parseInt(nPins)} nDisks={parseInt(nDisks)} />;
}

const Game = ({ nPins = 4, nDisks = 5 }) => {
  const classes = useStyles();

  const [state, setState] = React.useState([[]])
  const [startState, setStartState] = React.useState(null)
  const [endState, setEndState] = React.useState(null)
  const [focus, setFocus] = React.useState(null)
  const [nMoves, setNMoves] = React.useState(null)
  
  const audio = new Audio("button1.ogg");

  React.useEffect(() => {
    const startState = Array(nPins).fill().map(x => [])
    startState[0] = range(nDisks, 0)
    setStartState(startState)
    setState(cloneDeep(startState))
    const endState = Array(nPins).fill().map(x => [])
    endState[nPins - 1] = range(nDisks, 0)
    setEndState(endState)
    return () => { };
  }, [nPins, nDisks])

  const venceu = isEqual(state, endState)

  const onClick = (x) => {
    if (x === focus) {
      setFocus(null);
    } else if (focus === null) {
      setFocus(x);
    } else if (isEmpty(state[x]) || (last(state[focus]) < last(state[x]))) {
      audio.play();
      let newState = cloneDeep(state)
      newState[x].push(newState[focus].pop())
      setState(newState)
      setFocus(null)
      setNMoves(nMoves + 1)
    }
  }

  const w = window.innerWidth, h = window.innerHeight, p = 50

  const dims = (x, y, dx, dy) => {
    const xScale = (x) => x / nPins * (w - 2 * p)
    const yScale = (y) => y / nDisks * (h - 2 * p)
    return ({
      x: p + xScale(x + (1 - dx) / 2),
      y: h - p - yScale(y + 1),
      width: xScale(dx),
      height: yScale(dy),
      rx: yScale(1 / 4)
    })
  }

  const disk_xy = flatten(state.map((disks, x) => disks.map((disk, y) => [disk, x, y])))
  const pins = range(nPins).map(i => [0, i, nDisks - 1])

  const restart = () => {
    setState(startState);
    setNMoves(0);
  }

  return (
    <React.Fragment>
      <svg width={w} height={h}>
          {disk_xy.concat(pins).map(([disk, x, y]) => (
              <rect key={`${disk}_${x}_${y}`}
                {...dims(x, y, (disk + 1) / nDisks, disk ? 1 : nDisks)}
                style={{
                  fill: disk ? `hsla(${Math.trunc(360 * disk / nDisks)},100%,50%,1.0)` : 'black',
                  stroke: 'black',
                  strokeWidth: disk ? 5 : 0,
                  opacity: (focus === x && last(state[x]) === disk) ? 1 : .5
                }}
                onClick={() => onClick(x)}
              />
          ))}
      </svg>
      <div className={classes.fab}>
        <Fab >
          <AddIcon onClick={restart} />
        </Fab>
        <Fab color="secondary">
          <EditIcon />
        </Fab>
      </div>
      <Dialog open={venceu} onClose={restart}>
        <DialogTitle >{"Venceu!!!"}</DialogTitle>
        <DialogContent>
          <DialogContentText> Você levou {nMoves} passos! Consegue fazer melhor? </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={restart}> Jogar de novo! </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment >
  )
}