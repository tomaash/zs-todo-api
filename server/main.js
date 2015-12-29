import koa from 'koa';
import logger from 'koa-logger';
import responseTime from 'koa-response-time';
import koaRouter from 'koa-router';
import bodyParser from 'koa-bodyparser';
import mongoose from 'mongoose';
import cors from 'kcors';

const app = koa();
const router = koaRouter();
const env = process.env.NODE_ENV || 'development';

// Load config for MongoDB and koa
const config = require(__dirname + "/config.js")

console.log(process.env);
const mongoUrl = process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || config.mongodb.host + ':' + config.mongodb.port + '/' + config.mongodb.db;
mongoose.connect(mongoUrl, { server: {poolSize: 1000}});

app.use(cors());
app.use(responseTime());
app.use(logger());
app.use(bodyParser());

const TodoSchema = new mongoose.Schema({
    name: String,
    description: String,
    done: Boolean,
    createdAt: {
      type: Date,
      default: Date.now,
      index: 1
    }
  });

const Todo = mongoose.model('todo', TodoSchema);


router.get('/todos', function * (next) {
  yield next;
  // try {
  const result = yield Todo.find({}).limit(20).sort('-createdAt').exec();
  return this.body = result;
  // } catch (error) {
  //   return this.body = error;
  // }
});

router.post('/todos', function * (next) {
  yield next;
  var todo = new Todo(this.request.body);
  const result = yield todo.save();
  return this.body = result;
});

app
  .use(router.routes())
  .use(router.allowedMethods());

const port = process.env.PORT || 3000;
app.listen(port);

console.log(`Application started on port ${port}`);
if (process.send) {
  process.send('online');
}