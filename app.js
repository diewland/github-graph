var all_items = null;
var counts    = null;
var keys      = null;
var values    = null;

// http://stackoverflow.com/questions/1484506/random-color-generator-in-javascript
function random_color(){
  return '#'+Math.floor(Math.random()*16777215).toString(16);
}

function draw_graph(data){
  // prepare data
  counts = {};
  data.map(function(o){
    return o.language;
  }).forEach(function(k){
    counts[k] = (counts[k]||0)+1;
  });
  // keys   = Object.keys(counts);   --- not work on android chrome
  // values = Object.values(counts); --- not work on android chrome
  keys   = [];
  values = [];
  $.each(counts, function(k, v){
    keys.push(k);
    values.push(v);
  })

  // random graph color
  colors = [];
  keys.forEach(function(){
    colors.push(random_color());
  });
  colors = colors[0]; // TODO for line graph

  // draw graph
  if(window.chart){
    chart.data.labels = keys;
    chart.data.datasets[0].data = values;
    chart.data.datasets[0].backgroundColor = colors;
    chart.update();
  }
  else {
    var ctx = document.getElementById("myChart");
    window.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: keys,
            datasets: [{
                label: '# of Languages',
                data: values,
                backgroundColor: colors,
            }]
        },
    });
  }
}

// after fetch process
function do_when_fetch_done(username, type, data){
  sessionStorage.setItem(type+'_'+username, JSON.stringify(data));
  draw_graph(data);
  $('#search').removeClass('is-loading');
}

// fetch data from github api or use cache
function fetch_data(username, type, page_no){
  var cache_items = sessionStorage.getItem(type+'_'+username) || null;
  if(cache_items){
    cache_items = JSON.parse(cache_items);
    console.log('<'+ username +'|'+ type +'> use cache data {'+ cache_items.length +'}');
    do_when_fetch_done(username, type, cache_items);
  }
  else {
    var page_no = page_no || 1;
    $.ajax({
      url: 'https://api.github.com/users/'+ username +'/'+ type +'?page='+ page_no,
      success: function(items){
        if(items.length > 0){
          console.log('<'+ username +'|'+ type +'> fetching page '+ page_no +'.. {'+ items.length +'}');
          all_items = all_items.concat(items);
          fetch_data(username, type, page_no+1);
        }
        else {
          console.log('<'+ username +'|'+ type +'> fetch done');
          do_when_fetch_done(username, type, all_items);
        }
      },
      error: function(a, b, c){
        alert(a.responseJSON.message);
        console.log(a, b, c);
        $('#search').removeClass('is-loading');
      }
    });
  }
}

// bind search event
$('#search').click(function(){
  all_items = [];
  $('#search').addClass('is-loading');
  fetch_data($('#username').val(), $('#type').val());
});
$('#username').keypress(function(e) {
  if(e.which == 13) {
    $('#search').click();
  }
});

// when start, draw diewland graph
$('#search').click();
