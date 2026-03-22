import { AlertRulePayload, AlertRuleUpdatePayload } from "../config/alert"
import { mockApi } from "./mock"

export async function getAlerts() {
  return mockApi.getAlerts()
}

export async function getAlert(alertId: string) {
  return mockApi.getAlert(alertId)
}

export async function acknowledgeAlert(alertId: string) {
  return mockApi.acknowledgeAlert(alertId)
}

export async function resolveAlert(alertId: string) {
  return mockApi.resolveAlert(alertId)
}

export async function createAlertRule(payload: AlertRulePayload) {
  return mockApi.createAlertRule(payload)
}

export async function getAlertRules(brand_id: string) {
  return mockApi.getAlertRules(brand_id)
}

export async function updateAlertRule(ruleId: string, payload: AlertRuleUpdatePayload) {
  return mockApi.updateAlertRule(ruleId, payload)
}

export async function deleteAlertRule(ruleId: string) {
  return mockApi.deleteAlertRule(ruleId)
}
