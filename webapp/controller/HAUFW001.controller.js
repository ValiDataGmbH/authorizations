sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/odata/v4/ODataModel",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Sorter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/export/Spreadsheet"
], function (Controller,
    UIComponent,
    ODataModel,
    JSONModel,
    Sorter,
    Filter,
    FilterOperator,
    FilterType,
    Fragment,
    MessageToast,
    MessageBox,
    Spreadsheet
) {
    "use strict";

    return Controller.extend("authorization.controller.HAUFW001", {
        onInit: function () {
            this._oModel = this.getOwnerComponent().getModel();
            this._mViewSettingsDialogs = {};
            this.mGroupFunctions = {};
            sap.ui.getCore().getConfiguration().setLanguage("de");
        },
        onNavButtonPressed: function () {
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("RouteFunktion");
        },
        onCloseViewDialog: function () {
            this._oModel.resetChanges();
            sap.m.MessageToast.show("Aktion abgebrochen");
            this.byId("__inputCRUD0").setValue("");
            this.byId("__inputCRUD2").setValue("");
            this.byId("__inputCRUD3").setValue("");
            this.byId("selecttyp").setSelectedKey(null);
            this.oDialog.close();
        },
        onCloseEditDialog: function () {
            this._oModel.resetChanges();
            sap.m.MessageToast.show("Aktion abgebrochen");
            this.byId("__editCRUD0").setValue("");
            this.byId("__editCRUD2").setValue("");
            this.byId("__editCRUD3").setValue("");
            this.byId("selecttyp1").setSelectedKey(null);
            this.oDialogEdit.close();
        },
        onOpenDialog: function () {
            if (!this._oDialogCRUD) {
                this._oDialogCRUD = this.loadFragment({
                    name: "authorization.fragment.InputFieldsHAUFW001",
                    controller: this
                });
            }
            this._oDialogCRUD.then(function (oDialog) {
                this.oDialog = oDialog;
                this.oDialog.open();
            }.bind(this));
        },
        onCreatePress: function () {
            var oNewEntry = {},
                oView = this.getView(),
                fnSucces = function () {
                    sap.m.MessageToast.show("Element erfolgreich erstellt");
                    var oList = this.byId("table1");
                    oList.getItems().some(function (oItem) {
                        if (oItem.getBindingContext() === oContext) {
                            oItem.focus();
                            oItem.setSelected(true);
                            return true;
                        }
                    });
                }.bind(this),
                fnError = function (oError) {
                    sap.m.MessageBox.error(oError.message);
                }.bind(this);

            oNewEntry.funktion = this.getView().byId("__inputCRUD0").getValue();
            oNewEntry.typ = this.getView().byId("selecttyp").getSelectedItem().getText();
            oNewEntry.entit = this.getView().byId("__inputCRUD2").getValue();
            oNewEntry.wert = this.getView().byId("__inputCRUD3").getValue();

            // TODO: manejar la exception
            var oContext = this.byId("table1").getBinding("items").create({
                funktion: oNewEntry.funktion,
                typ: oNewEntry.typ,
                entit: oNewEntry.entit,
                wert: oNewEntry.wert
            });

            oContext.created().then(fnSucces, fnError).catch(function (oError) {
                if (!oError.canceled) {
                    throw oError;
                }
            });
            this._oModel.submitBatch("$auto").then(fnSucces, fnError);

            this.byId("table1").getBinding("items").refresh();
            this.byId("__inputCRUD0").setValue("");
            this.byId("__inputCRUD2").setValue("");
            this.byId("__inputCRUD3").setValue("");
            this.byId("selecttyp").setSelectedKey(null);
            this.byId("dialog1").close();
        },
        createValidation: function () {
            var iInput1 = this.byId("__inputCRUD0").getValue(),
                //sInput2 = this.byId("__inputCRUD1").getValue(),
                sInput3 = this.byId("__inputCRUD2").getValue(),
                sInput4 = this.byId("__inputCRUD3").getValue(),
                oInput1 = this.byId("__inputCRUD0"),
                //oInput2 = this.byId("__inputCRUD1"),
                oInput3 = this.byId("__inputCRUD2"),
                oInput4 = this.byId("__inputCRUD3");

            // validation single inputs	
            if (iInput1.length < 3 && iInput1.length > 0) {
                oInput1.setValueState(sap.ui.core.ValueState.None);
            } else {
                oInput1.setValueState(sap.ui.core.ValueState.Error);
            }
            /* if (isNaN(sInput2) && sInput2.length < 2) {
                oInput2.setValueState(sap.ui.core.ValueState.None);
            } else {
                oInput2.setValueState(sap.ui.core.ValueState.Error);
            } */
            if (isNaN(sInput3) && sInput3.length < 60) {
                oInput3.setValueState(sap.ui.core.ValueState.None);
            } else {
                oInput3.setValueState(sap.ui.core.ValueState.Error);
            }
            if (isNaN(sInput4) && sInput4.length < 60) {
                oInput4.setValueState(sap.ui.core.ValueState.None);
            } else {
                oInput4.setValueState(sap.ui.core.ValueState.Error);
            }

            // validation all inputs - next button
            if (iInput1.length < 3 && iInput1.length > 0 && isNaN(sInput3) && sInput3.length < 60 && isNaN(sInput4) && sInput4.length < 60) {
                this.byId("createButton").setVisible(true);
            } else {
                this.byId("createButton").setVisible(false);
            }
        },
        editValidation: function () {
            var iInput1 = this.byId("__editCRUD0").getValue(),
                //sInput2 = this.byId("__editCRUD1").getValue(),
                sInput3 = this.byId("__editCRUD2").getValue(),
                sInput4 = this.byId("__editCRUD3").getValue(),
                oInput1 = this.byId("__editCRUD0"),
                //oInput2 = this.byId("__editCRUD1"),
                oInput3 = this.byId("__editCRUD2"),
                oInput4 = this.byId("__editCRUD3");

            // validation single inputs	
            if (iInput1.length < 4 && iInput1.length > 0) {
                oInput1.setValueState(sap.ui.core.ValueState.None);
            } else {
                oInput1.setValueState(sap.ui.core.ValueState.Error);
            }
            /* if (isNaN(sInput2) && sInput2.length < 3) {
                oInput2.setValueState(sap.ui.core.ValueState.None);
            } else {
                oInput2.setValueState(sap.ui.core.ValueState.Error);
            } */
            if (isNaN(sInput3) && sInput3.length < 61) {
                oInput3.setValueState(sap.ui.core.ValueState.None);
            } else {
                oInput3.setValueState(sap.ui.core.ValueState.Error);
            }
            if (isNaN(sInput4) && sInput4.length < 61) {
                oInput4.setValueState(sap.ui.core.ValueState.None);
            } else {
                oInput4.setValueState(sap.ui.core.ValueState.Error);
            }

            // validation all inputs - next button
            if (iInput1.length < 4 && iInput1.length > 0 && isNaN(sInput3) && sInput3.length < 61 && isNaN(sInput4) && sInput4.length < 61) {
                this.byId("editButton").setVisible(true);
            } else {
                this.byId("editButton").setVisible(false);
            }
        },
        onUpdateEditPress: function () {
            var oUpdateEntry = {},
                oModel = this.getView().getModel(),
                oContext = this.byId("table1").getSelectedItem().getBindingContext(),
                sPath = oContext.getPath(),
                fnSucces = function () {
                    this._setBusy(false);
                    sap.m.MessageToast.show("Objekt erfolgreich aktualisiert");
                    var oList = this.byId("table1");
                    oList.getItems().some(function (oItem) {
                        if (oItem.getBindingContext() === oContext) {
                            oItem.focus();
                            oItem.setSelected(true);
                            return true;
                        }
                    });
                    this._setUIChanges(false);
                }.bind(this),
                fnError = function (oError) {
                    this._setBusy(false);
                    sap.m.MessageBox.error(oError.message);
                    this._setUIChanges(false);
                }.bind(this),
                iIndex = oContext.getIndex();

            oUpdateEntry.funktion = this.getView().byId("__editCRUD0").getValue();
            oUpdateEntry.typ = this.getView().byId("selecttyp1").getSelectedItem().getText();
            oUpdateEntry.entit = this.getView().byId("__editCRUD2").getValue();
            oUpdateEntry.wert = this.getView().byId("__editCRUD3").getValue();

            //oContext.setProperty("InfoAuthName",oUpdateEntry.InfoAuthName,"$auto",false);     
            //oContext.setProperty("NameCube",oUpdateEntry.NameCube,"$auto",false);
            //oContext.setProperty("InfoName",oUpdateEntry.InfoName,"$auto",false);
            //oContext.setProperty("InfoTyp",oUpdateEntry.InfoTyp,"$auto",false);
            //oContext.setProperty("Sequenz",oUpdateEntry.Sequenz,"$auto",false);  

            //oContext.requestProperty("Sequenz").then(oContext.setProperty("Sequenz",oUpdateEntry.Sequenz,)) ;

            oContext.setProperty("Sequenz", oUpdateEntry.Sequenz);
            this._oModel.submitChanges();

            //this._setBusy(false);
            //oContext.requestObject().then(oContext.delete("$auto").then(fnSucces, fnError));                     
            //this._bTechnicalErrors = false;            
            //this.byId("table1").getBinding("items").refresh();  


            if (oContext.hasPendingChanges()) {
                this._oModel.submitBatch("$auto").then(fnSucces, fnError);
                sap.m.MessageToast.show("Kann aufgrund von anstehenden Änderungen nicht aktualisiert werden");
            }
            else {
                //this._oModel.submitBatch("$auto").then(fnSucces, fnError);
                oContext.refresh();
                this.byId("dialog2").close();
            }

            //this._oModel.resetChanges();                                    
            //var oContext = this.byId("table1").getBinding("items").update();

        },
        onUpdatePress: function () {
            var oSelectedItem = this.byId("table1").getSelectedItem();

            if (oSelectedItem) {
                var oView = this.getView(),
                    oContext = oSelectedItem.getBindingContext(),
                    oEntry = oContext.getObject();
                if (!this._oDialogEdit) {
                    this._oDialogEdit = this.loadFragment({
                        name: "authorization.fragment.EditDialogHAUFW001",
                        controller: this
                    });
                }
                this._oDialogEdit.then(function (oDialog) {
                    this.oDialogEdit = oDialog;
                    oView.addDependent(this.oDialogEdit);
                    this.oDialogEdit.bindElement({
                        path: '/HAUFW001'
                    });
                    this.oDialogEdit.open();

                    this.byId("__editCRUD0").setValue(oEntry.funktion);
                    //this.byId("__editCRUD1").setValue(oEntry.typ);
                    this.byId("__editCRUD2").setValue(oEntry.entit);
                    this.byId("__editCRUD3").setValue(oEntry.wert);

                }.bind(this));

            } else {
                sap.m.MessageBox.warning("Es wurde kein Element zur Aktualisierung ausgewählt");
            }
        },
        onDeletePress: function () {
            var oSelectedItem = this.byId("table1").getSelectedItem(),
                fnSucces = function () {
                    sap.m.MessageToast.show("Element (" + sFunktion + ") erfolgreich gelöscht");
                },
                fnError = function (oError) {
                    sap.m.MessageBox.error(oError.message);
                };

            if (oSelectedItem) {
                var oContext = oSelectedItem.getBindingContext(),
                    sFunktion = oContext.getProperty("funktion");

                oContext.requestObject().then(oContext.delete("$auto").then(fnSucces, fnError));

            } else {
                sap.m.MessageBox.warning("kein Element zum Löschen ausgewählt");
            }
        },
        onSearch: function (oEvent) {
            var aFilters = [],
                sQuery = oEvent.getSource().getValue();

            if (sQuery && sQuery.length > 0) {
                var filter = new sap.ui.model.Filter([
                    new sap.ui.model.Filter("typ", sap.ui.model.FilterOperator.Contains, sQuery),
                    new sap.ui.model.Filter("funktion", sap.ui.model.FilterOperator.Contains, sQuery),
                    new sap.ui.model.Filter("wert", sap.ui.model.FilterOperator.Contains, sQuery),
                    new sap.ui.model.Filter("entit", sap.ui.model.FilterOperator.Contains, sQuery)
                ], false);
                aFilters.push(filter);
            }
            this.byId("table1").getBinding("items").filter(aFilters, sap.ui.model.FilterType.Application);

        },
        getViewSettingsDialog: function (sDialogFragmentName) {
            var pDialog = this._mViewSettingsDialogs[sDialogFragmentName];
            if (!pDialog) {
                pDialog = sap.ui.core.Fragment.load({
                    id: this.getView().getId(),
                    name: sDialogFragmentName,
                    controller: this
                }).then(function (oDialog) {
                    return oDialog;
                });
                this._mViewSettingsDialogs[sDialogFragmentName] = pDialog;
            }
            return pDialog;
        },
        resetGroupDialog: function (oEvent) {
            this.groupReset = true;
        },
        handleSortButtonPressed: function () {
            this.getViewSettingsDialog("authorization.fragment.SortDialogHAUFW001")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },
        handleFilterButtonPressed: function () {
            this.getViewSettingsDialog("authorization.fragment.FilterDialogHAUFW001")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },
        handleGroupButtonPressed: function () {
            this.getViewSettingsDialog("authorization.fragment.GroupDialogHAUFW001")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },
        handleSortDialogConfirm: function (oEvent) {
            var mParams = oEvent.getParameters(),
                sPath = mParams.sortItem.getKey(),
                bDescending = mParams.sortDescending,
                aSorters = [];

            aSorters.push(new sap.ui.model.Sorter(sPath, bDescending));
            this.byId("table1").getBinding("items").sort(aSorters);
        },
        handleFilterDialogConfirm: function (oEvent) {
            var mParams = oEvent.getParameters(),
                aFilters = [];

            mParams.filterItems.forEach(function (oItem) {
                var aSplit = oItem.getKey().split("___"),
                    sPath = aSplit[0],
                    sValue = aSplit[1],
                    oFilter = new sap.ui.model.Filter(sPath, sap.ui.model.FilterOperator.Contains, sValue);
                aFilters.push(oFilter);
            });
            this.byId("table1").getBinding("items").filter(aFilters, sap.ui.model.FilterType.Application);

        },
        handleGroupDialogConfirm: function (oEvent) {
            var mParams = oEvent.getParameters(),
                sPath,
                bDescending,
                vGroup,
                aGroups = [];

            if (mParams.groupItem) {
                sPath = mParams.groupItem.getKey();
                bDescending = mParams.groupDescending;
                vGroup = this.mGroupFunctions[sPath];
                aGroups.push(new sap.ui.model.Sorter(sPath, bDescending, vGroup));

                this.byId("table1").getBinding("items").sort(aGroups);

            } else if (this.groupReset) {
                this.byId("table1").getBinding("items").sort();
                this.groupReset = false;
            }
        },
        createColumnConfig: function () {
            var aCols = [];

            aCols.push({
                property: 'funktion',
                type: sap.ui.export.EdmType.Number
            });
            aCols.push({
                property: 'typ',
                type: sap.ui.export.EdmType.String
            });
            aCols.push({
                property: 'entit',
                type: sap.ui.export.EdmType.String
            });
            aCols.push({
                property: 'wert',
                type: sap.ui.export.EdmType.String
            });

            return aCols;
        },
        onExport: function () {
            var aCols, oRowBinding, oSettings, oSheet, oTable;

            if (!this._oTable) {
                this._oTable = this.byId("table1");
            }
            oTable = this._oTable;
            oRowBinding = oTable.getBinding('items');
            aCols = this.createColumnConfig();

            oSettings = {
                workbook: {
                    columns: aCols,
                    hierarchyLevel: 'Level'
                },
                dataSource: oRowBinding,
                fileName: 'Table export HAUFW001.xlsx',
                worker: false
            };

            oSheet = new sap.ui.export.Spreadsheet(oSettings);
            oSheet.build().finally(function () {
                oSheet.destroy();
            });
        },
        _setUIChanges: function (bHasUIChanges) {
            if (this._bTechnicalErrors) {
                // If there is currently a technical error, then force 'true'.
                bHasUIChanges = true;
            } else if (bHasUIChanges === undefined) {
                bHasUIChanges = this.getView().getModel().hasPendingChanges();
            }

            var oContext = this.byId("table1").getSelectedItem().getBindingContext().setProperty("/hasUIChanges", bHasUIChanges);
            //var oModel = this._oModel.setProperty("/hasUIChanges", bHasUIChanges);
        },
        _setBusy: function (bIsBusy) {
            //var oModel = this._oModel.setProperty("/busy", bIsBusy);
            //var oContext = this.byId("table1").getSelectedItem().getBindingContext().setProperty("/busy", bIsBusy);
            var oView = this.getView().setBusy(bIsBusy);
        }
    });
});