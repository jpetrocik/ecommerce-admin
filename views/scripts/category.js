var categories = {};

(function($){	

	var CategoryList = Backbone.Collection.extend({
		model: DataModels.Category,
		parentId: 1,
		url: function() {
			return "http://localhost:8080/admin/catalog/" + this.parentId + "?depth=2";
		},
		parse: function(data) {
   			return data.subCategories;
  		}
	});


	var CategoryView = Backbone.View.extend( {
		template: $("#templates .searchItem"),
		expanded: false,

		initialize: function() {
			_.bindAll(this, 'render');

			this.listenTo(this.model, "change", this.render);
			this.render();
		},

		render: function() {
			var that = this;
			var category = this.model.toJSON();

			var newEl = this.template.clone();
			newEl.find(".item").html(category.name);
			newEl.find(".item").on("click", function(e) {

				//PROBLEM style is applied to childern
				//remove previous selection and select this
				//$(".selected").removeClass("selected");
				//newEl.addClass("selected");

				if (!that.expanded) { //expand tree
					if (category.subCategories != null && category.subCategories.length > 0) {
						var subCategoryList = new CategoryList();
						subCategoryList.parentId = category.id;
						var subCategoryView = new CategoryListView({
							collection: subCategoryList,
							el: newEl
						});
						subCategoryList.fetch({reset: true});
					}
					that.expanded = true;
				} else {
					//close and removed all subs
					that.expanded = false;
					newEl.find(".subItems").empty();
				}

				categories.ui.categoryEditView.setModel(that.model);
			});

			this.$el.find(".subItems").first().append(newEl);
		}
	});


	var CategoryListView = Backbone.View.extend( {
		loading: true,
		initialize: function() {
			_.bindAll(this,'render');

			this.listenTo(this.collection, "add", this.render);
			this.listenTo(this.collection, "reset", this.render);

			this.$el.append("<div class='loading'><img src='assets/loading.gif'/></div>");

		},

		render: function() {
			if (this.loading) {
				this.$el.find(".loading").remove();
				loading=false;
			}
			_.each(this.collection.models, function(d) {
				new CategoryView({
					model: d,
					el : this.el
				});
			}, this);
		}
	});

	var CategoryEditView = Backbone.View.extend( {
		initialize: function() {
			_.bindAll(this, 'render');

			var that = this;
			//setup autosave
			$("#name").on("change", function(e){
				that.model.set({name: $(e.currentTarget).val()});
			});
			$("#shortDescr").on("change", function(e){
				that.model.set({shortDescr: $(e.currentTarget).val()});
				that.model.save();
			});
			$("#longDescr").on("change", function(e){
				that.model.set({longDescr: $(e.currentTarget).val()});
			});
			$("#active").on("change", function(e){
				that.model.set({active: $(e.currentTarget).val()});
			});

			this.disableForm(true);
		},
		disableForm: function(value) {
			$("#editForm input").prop( "disabled", value);
			$("#editForm textarea").prop( "disabled", value);
			$("#editForm select").prop( "disabled", value);
		},
		setModel: function(newModel) {
			this.model = newModel;
			this.render();
		},

		render: function() {
			var that = this;
			var category = this.model.toJSON();

			this.disableForm(false);

			$("#name").val(category.name);
			$("#shortDescr").val(category.shortDescr);
			$("#longDescr").val(category.longDescr);
			$("#active").val(category.active?"true":"false");

			$("#keywords").empty();
			$(category.keywords).each(function(i, e){
				$("#keywords").append("<span class='tag'>" + e + "</span>");
			})

			$("#paths").empty();
			$(category.paths).each(function(i, paths){
				var newPathEl = $("#paths").append("<div></div>");
				$(paths.path).each(function(i, p){
					newPathEl.append("/ <a href='#categoryId=" + p.id + "'>" + p.name + "</a>");
				});
			});

		}
	});





	categories = {
		models: {},
		ui: {},

		init: function() {
			this.models.categories = new CategoryList();

			this.ui = {
				categoryList: new CategoryListView({
					collection: this.models.categories,
					el: "#searchResults"
				}),
				categoryEditView: new CategoryEditView()
			}

			this.models.categories.fetch({reset: true});
		}
	};



})(jQuery);